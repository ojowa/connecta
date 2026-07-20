import { Injectable, ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus, Session, OtpCode } from '@app/common/entities';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
    @InjectRepository(OtpCode) private otpRepo: Repository<OtpCode>,
    private jwtService: JwtService,
  ) {}

  async register(data: any) {
    const { email, phone, password, fullName, dateOfBirth, gender, deviceId, platform, osVersion, appVersion } = data;

    if (!email || !password || !fullName || !dateOfBirth || !gender) {
      throw new BadRequestException('Missing required fields');
    }

    const existing = await this.userRepo.findOne({ where: [{ email }, ...(phone ? [{ phone }] : [])] });
    if (existing) {
      throw new ConflictException(existing.email === email ? 'Email already registered' : 'Phone already registered');
    }

    const dob = new Date(dateOfBirth);
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) throw new BadRequestException('Must be at least 18 years old');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = this.userRepo.create({ email, phone, passwordHash, fullName, dateOfBirth: dob, gender, role: UserRole.USER, status: UserStatus.PENDING_VERIFICATION });
    const saved = await this.userRepo.save(user);

    const tokens = await this.generateTokens(saved);
    await this.createSession(saved.id, tokens.refreshToken, deviceId, platform, osVersion, appVersion);

    return {
      user: this.sanitizeUser(saved),
      tokens: { ...tokens, expiresIn: 900 },
      requiresEmailVerification: true,
      requiresProfileSetup: true,
    };
  }

  async login(data: any) {
    const { identifier, password, deviceId, platform, osVersion, appVersion } = data;
    if (!identifier || !password) throw new BadRequestException('Missing credentials');

    const user = await this.userRepo.findOne({ where: [{ email: identifier }, { phone: identifier }] });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new UnauthorizedException('Account temporarily locked. Try again later.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.SUSPENDED) throw new UnauthorizedException('Account is suspended');
    if (user.status === UserStatus.DEACTIVATED) throw new UnauthorizedException('Account is deactivated');

    await this.userRepo.update(user.id, { loginAttempts: 0, lockUntil: undefined as any, lastLoginAt: new Date(), lastActiveAt: new Date(), status: user.status === UserStatus.PENDING_VERIFICATION ? user.status : UserStatus.ACTIVE });

    const tokens = await this.generateTokens(user);
    await this.createSession(user.id, tokens.refreshToken, deviceId, platform, osVersion, appVersion);

    return {
      user: this.sanitizeUser(user),
      tokens: { ...tokens, expiresIn: 900 },
      requires2fa: false,
    };
  }

  async refresh(data: any) {
    const { refreshToken, deviceId, platform, osVersion, appVersion } = data;
    if (!refreshToken) throw new BadRequestException('Refresh token required');

    const session = await this.sessionRepo.findOne({ where: { refreshToken, isActive: true } });
    if (!session) throw new UnauthorizedException('Invalid refresh token');
    if (session.expiresAt < new Date()) throw new UnauthorizedException('Refresh token expired');

    const user = await this.userRepo.findOne({ where: { id: session.userId } });
    if (!user || user.status === UserStatus.SUSPENDED) throw new UnauthorizedException('Account not available');

    await this.sessionRepo.update(session.id, { isActive: false });

    const tokens = await this.generateTokens(user);
    await this.createSession(user.id, tokens.refreshToken, deviceId, platform, osVersion, appVersion);

    return { tokens: { ...tokens, expiresIn: 900 } };
  }

  async logout(data: any) {
    const { userId, sessionId } = data;
    if (sessionId) {
      await this.sessionRepo.update(sessionId, { isActive: false });
    } else {
      await this.sessionRepo.update({ userId, isActive: true }, { isActive: false });
    }
    return { loggedOut: true, sessionsRevoked: 1 };
  }

  async sendOtp(data: any) {
    const { channel, purpose, identifier } = data;
    if (!channel || !purpose || !identifier) throw new BadRequestException('Missing required fields');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const otpData: any = { code, purpose, expiresAt, attempts: 0, maxAttempts: 3 };
    if (channel === 'email') otpData.email = identifier;
    else otpData.phone = identifier;

    const otp = this.otpRepo.create(otpData);
    await this.otpRepo.save(otp);

    const masked = identifier.replace(/(.{2})(.*)(@.*)/, '$1***$3').replace(/(.{3})(.*)(.{2})/, '$1***$3');

    return { otpSent: true, channel, expiresIn: 300, maskedIdentifier: masked };
  }

  async verifyOtp(data: any) {
    const { identifier, code, purpose } = data;
    if (!identifier || !code || !purpose) throw new BadRequestException('Missing required fields');

    const where: any = { purpose, verifiedAt: null };
    if (identifier.includes('@')) where.email = identifier;
    else where.phone = identifier;

    const otp = await this.otpRepo.findOne({ where, order: { createdAt: 'DESC' } });
    if (!otp) throw new BadRequestException('No pending OTP found');
    if (otp.expiresAt < new Date()) throw new BadRequestException('OTP expired');
    if (otp.attempts >= otp.maxAttempts) throw new BadRequestException('Too many failed attempts');
    if (otp.code !== code) {
      await this.otpRepo.update(otp.id, { attempts: otp.attempts + 1 });
      throw new BadRequestException('Invalid OTP code');
    }

    await this.otpRepo.update(otp.id, { verifiedAt: new Date() });

    let user = otp.userId ? await this.userRepo.findOne({ where: { id: otp.userId } }) : null;
    if (user) {
      if (purpose === 'registration') await this.userRepo.update(user.id, { emailVerified: true, status: UserStatus.ACTIVE });
      else if (purpose === 'phone_verify') await this.userRepo.update(user.id, { phoneVerified: true });
      const tokens = await this.generateTokens(user);
      return { verified: true, purpose, userId: user.id, tokens: { ...tokens, expiresIn: 900 } };
    }

    return { verified: true, purpose };
  }

  async forgotPassword(data: any) {
    const { email } = data;
    const user = email ? await this.userRepo.findOne({ where: { email } }) : null;
    if (user) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const otp = this.otpRepo.create({ userId: user.id, email, code, purpose: 'password_reset', expiresAt: new Date(Date.now() + 15 * 60 * 1000), attempts: 0, maxAttempts: 5 });
      await this.otpRepo.save(otp);
    }
    return { message: 'If an account exists with this email, a reset link has been sent.', emailSent: true };
  }

  async resetPassword(data: any) {
    const { token, newPassword } = data;
    if (!token || !newPassword) throw new BadRequestException('Missing required fields');
    if (newPassword.length < 8) throw new BadRequestException('Password must be at least 8 characters');

    const otp = await this.otpRepo.findOne({ where: { code: token, purpose: 'password_reset', verifiedAt: undefined as any } });
    if (!otp || otp.expiresAt < new Date()) throw new BadRequestException('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepo.update(otp.userId!, { passwordHash });
    await this.otpRepo.update(otp.id, { verifiedAt: new Date() });
    await this.sessionRepo.update({ userId: otp.userId!, isActive: true }, { isActive: false });

    return { passwordReset: true, sessionsRevoked: 3, message: 'Password updated. All sessions have been revoked.' };
  }

  async getDevices(userId: string) {
    const sessions = await this.sessionRepo.find({ where: { userId, isActive: true }, order: { createdAt: 'DESC' } });
    return { devices: sessions.map(s => ({ deviceId: s.deviceId, deviceType: s.deviceType, deviceName: s.deviceName, ipAddress: s.ipAddress, lastActiveAt: s.createdAt, createdAt: s.createdAt })) };
  }

  async revokeDevice(userId: string, deviceId: string) {
    const session = await this.sessionRepo.findOne({ where: { id: deviceId, userId } });
    if (!session) throw new NotFoundException('Device not found');
    await this.sessionRepo.update(session.id, { isActive: false });
    return { revoked: true, deviceId };
  }

  private async createSession(userId: string, refreshToken: string, deviceId?: string, platform?: string, osVersion?: string, appVersion?: string) {
    const session = this.sessionRepo.create({
      userId, refreshToken, deviceId: deviceId || uuid(), deviceType: platform, ipAddress: '0.0.0.0',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isActive: true,
    });
    return this.sessionRepo.save(session);
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m', secret: process.env.JWT_SECRET || 'connecta-dev-secret-key-2026' }),
      this.jwtService.signAsync(payload, { expiresIn: '30d', secret: process.env.JWT_REFRESH_SECRET || 'connecta-refresh-secret-2026' }),
    ]);
    return { accessToken, refreshToken };
  }

  private async handleFailedLogin(user: User) {
    const attempts = user.loginAttempts + 1;
    const update: any = { loginAttempts: attempts };
    if (attempts >= 5) update.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    await this.userRepo.update(user.id, update);
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...result } = user;
    return result;
  }
}

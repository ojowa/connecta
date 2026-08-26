import { Injectable, ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcryptjs';
import otplib from 'otplib';
import * as QRCode from 'qrcode';
import { User, UserRole, UserStatus, Session, OtpCode, BiometricCredential } from '@app/common/entities';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
    @InjectRepository(OtpCode) private otpRepo: Repository<OtpCode>,
    @InjectRepository(BiometricCredential) private biometricRepo: Repository<BiometricCredential>,
    private jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async register(data: any) {
    const { email, phone, password, fullName, dateOfBirth, gender, deviceId, platform, osVersion, appVersion } = data;
    if (!email || !password || !fullName || !dateOfBirth || !gender) throw new BadRequestException('Missing required fields');
    const existing = await this.userRepo.findOne({ where: [{ email }, ...(phone ? [{ phone }] : [])] });
    if (existing) throw new ConflictException(existing.email === email ? 'Email already registered' : 'Phone already registered');
    const dob = new Date(dateOfBirth);
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) throw new BadRequestException('Must be at least 18 years old');
    const passwordHash = await bcrypt.hash(password, 12);
    const user = this.userRepo.create({ email, phone, passwordHash, fullName, dateOfBirth: dob, gender, role: UserRole.USER, status: UserStatus.PENDING_VERIFICATION });
    const saved = await this.userRepo.save(user);
    const tokens = await this.generateTokens(saved);
    await this.createSession(saved.id, tokens.refreshToken, deviceId, platform, osVersion, appVersion);
    this.eventEmitter.emit('user.created', { userId: saved.id, email: saved.email, phone: saved.phone, fullName: saved.fullName, gender: saved.gender, dateOfBirth: saved.dateOfBirth });
    return { user: this.sanitizeUser(saved), tokens: { ...tokens, expiresIn: 900 }, requiresEmailVerification: true, requiresProfileSetup: true };
  }

  async login(data: any) {
    const { identifier, password, deviceId, platform, osVersion, appVersion } = data;
    if (!identifier || !password) throw new BadRequestException('Missing credentials');
    const user = await this.userRepo.findOne({ where: [{ email: identifier }, { phone: identifier }] });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.lockUntil && user.lockUntil > new Date()) throw new UnauthorizedException('Account temporarily locked. Try again later.');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { await this.handleFailedLogin(user); throw new UnauthorizedException('Invalid credentials'); }
    if (user.status === UserStatus.SUSPENDED) throw new UnauthorizedException('Account is suspended');
    if (user.status === UserStatus.DEACTIVATED) throw new UnauthorizedException('Account is deactivated');

    if (user.twoFactorEnabled) {
      const tempToken = this.jwtService.sign(
        { sub: user.id, purpose: '2fa_verify' },
        { expiresIn: '5m', secret: process.env.JWT_SECRET || '' },
      );
      return { requires2fa: true, tempToken, method: user.twoFactorMethod, user: this.sanitizeUser(user) };
    }

    await this.userRepo.update(user.id, { loginAttempts: 0, lockUntil: undefined as any, lastLoginAt: new Date(), lastActiveAt: new Date(), status: user.status === UserStatus.PENDING_VERIFICATION ? user.status : UserStatus.ACTIVE });
    const tokens = await this.generateTokens(user);
    await this.createSession(user.id, tokens.refreshToken, deviceId, platform, osVersion, appVersion);
    this.eventEmitter.emit('user.logged_in', { userId: user.id, email: user.email });
    return { user: this.sanitizeUser(user), tokens: { ...tokens, expiresIn: 900 }, requires2fa: false };
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
    if (sessionId) { await this.sessionRepo.update(sessionId, { isActive: false }); }
    else { await this.sessionRepo.update({ userId, isActive: true }, { isActive: false }); }
    this.eventEmitter.emit('user.logged_out', { userId });
    return { loggedOut: true, sessionsRevoked: 1 };
  }

  async sendOtp(data: any) {
    const { channel, purpose, identifier } = data;
    if (!channel || !purpose || !identifier) throw new BadRequestException('Missing required fields');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const otpData: any = { code, purpose, expiresAt, attempts: 0, maxAttempts: 3 };
    if (channel === 'email') otpData.email = identifier; else otpData.phone = identifier;
    const otp = this.otpRepo.create(otpData);
    await this.otpRepo.save(otp);
    const masked = identifier.includes('@') ? identifier.replace(/(.{2})(.*)(@.*)/, '$1***$3') : identifier.replace(/(.{3})(.*)(.{2})/, '$1***$3');
    return { otpSent: true, channel, expiresIn: 300, maskedIdentifier: masked };
  }

  async verifyOtp(data: any) {
    const { identifier, code, purpose } = data;
    if (!identifier || !code || !purpose) throw new BadRequestException('Missing required fields');
    const where: any = { purpose, verifiedAt: null };
    if (identifier.includes('@')) where.email = identifier; else where.phone = identifier;
    const otp = await this.otpRepo.findOne({ where, order: { createdAt: 'DESC' } });
    if (!otp) throw new BadRequestException('No pending OTP found');
    if (otp.expiresAt < new Date()) throw new BadRequestException('OTP expired');
    if (otp.attempts >= otp.maxAttempts) throw new BadRequestException('Too many failed attempts');
    if (otp.code !== code) { await this.otpRepo.update(otp.id, { attempts: otp.attempts + 1 }); throw new BadRequestException('Invalid OTP code'); }
    await this.otpRepo.update(otp.id, { verifiedAt: new Date() });
    const user = otp.userId ? await this.userRepo.findOne({ where: { id: otp.userId } }) : null;
    if (user) {
      if (purpose === 'registration') { await this.userRepo.update(user.id, { emailVerified: true, status: UserStatus.ACTIVE }); this.eventEmitter.emit('user.email_verified', { userId: user.id, email: user.email }); }
      else if (purpose === 'phone_verify') { await this.userRepo.update(user.id, { phoneVerified: true }); this.eventEmitter.emit('user.phone_verified', { userId: user.id, phone: user.phone }); }
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
    this.eventEmitter.emit('user.password_changed', { userId: otp.userId });
    return { passwordReset: true, sessionsRevoked: 3, message: 'Password updated. All sessions have been revoked.' };
  }

  async changePassword(userId: string, data: any) {
    const { currentPassword, newPassword } = data;
    if (!currentPassword || !newPassword) throw new BadRequestException('Missing required fields');
    if (newPassword.length < 8) throw new BadRequestException('Password must be at least 8 characters');
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect');
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepo.update(userId, { passwordHash });
    await this.sessionRepo.update({ userId, isActive: true }, { isActive: false });
    this.eventEmitter.emit('user.password_changed', { userId });
    return { passwordChanged: true, message: 'Password updated. Other sessions have been revoked.' };
  }

  async getDevices(userId: string) {
    const sessions = await this.sessionRepo.find({ where: { userId, isActive: true }, order: { createdAt: 'DESC' } });
    return { devices: sessions.map((s) => ({ deviceId: s.deviceId, deviceType: s.deviceType, deviceName: s.deviceName, ipAddress: s.ipAddress, lastActiveAt: s.createdAt, createdAt: s.createdAt })) };
  }

  async revokeDevice(userId: string, deviceId: string) {
    const session = await this.sessionRepo.findOne({ where: { id: deviceId, userId } });
    if (!session) throw new NotFoundException('Device not found');
    await this.sessionRepo.update(session.id, { isActive: false });
    return { revoked: true, deviceId };
  }

  async registerBiometric(userId: string, data: any) {
    const { deviceId, biometricType, publicKey, credentialId } = data;
    if (!deviceId || !biometricType || !publicKey || !credentialId) throw new BadRequestException('Missing required fields');
    const existing = await this.biometricRepo.findOne({ where: { credentialId } });
    if (existing) throw new ConflictException('Biometric credential already registered');
    const credential = this.biometricRepo.create({ userId, deviceId, biometricType, publicKey, credentialId, isActive: true });
    const saved = await this.biometricRepo.save(credential);
    return { biometricId: saved.id, biometricType, credentialId, enabled: true, createdAt: saved.createdAt };
  }

  async biometricLogin(data: any) {
    const { credentialId, signature, challenge } = data;
    if (!credentialId || !signature || !challenge) throw new BadRequestException('Missing required fields');
    const credential = await this.biometricRepo.findOne({ where: { credentialId, isActive: true } });
    if (!credential) throw new UnauthorizedException('Biometric credential not found');
    const user = await this.userRepo.findOne({ where: { id: credential.userId } });
    if (!user) throw new UnauthorizedException('User not found');
    if (user.status === UserStatus.SUSPENDED) throw new UnauthorizedException('Account is suspended');
    await this.userRepo.update(user.id, { lastLoginAt: new Date(), lastActiveAt: new Date() });
    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), tokens: { ...tokens, expiresIn: 900 } };
  }

  async removeBiometric(userId: string, biometricId: string) {
    if (!biometricId) throw new BadRequestException('Biometric ID required');
    const credential = await this.biometricRepo.findOne({ where: { id: biometricId, userId } });
    if (!credential) throw new NotFoundException('Biometric credential not found');
    await this.biometricRepo.remove(credential);
    return { removed: true, biometricId };
  }

  async get2FASettings(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return {
      enabled: user.twoFactorEnabled,
      method: user.twoFactorMethod,
      phone: user.phone ? user.phone.replace(/(.{3})(.*)(.{2})/, '$1***$3') : null,
      email: user.email ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
    };
  }

  async toggle2FA(userId: string, data: any) {
    const { enabled, method } = data;
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (enabled && method === 'authenticator') {
      throw new BadRequestException('Use /auth/2fa/setup to enable authenticator app');
    }

    await this.userRepo.update(userId, {
      twoFactorEnabled: enabled,
      twoFactorMethod: method || 'sms',
      twoFactorSecret: enabled ? user.twoFactorSecret : undefined,
    });
    return { twoFactorEnabled: enabled, method: method || 'sms' };
  }

  async setup2FA(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.twoFactorEnabled && user.twoFactorMethod === 'authenticator') {
      throw new BadRequestException('Authenticator app is already enabled. Disable it first.');
    }

    const secret = otplib.generateSecret();
    const otpauth = otplib.generateURI({ label: user.email, issuer: 'OJChat', secret });
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    await this.userRepo.update(userId, {
      twoFactorSecret: secret,
      twoFactorMethod: 'authenticator',
      twoFactorEnabled: false,
    });

    return { secret, qrCodeUrl, otpauth };
  }

  async verify2FASetup(userId: string, code: string) {
    if (!code || code.length !== 6) throw new BadRequestException('Invalid code format');
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.twoFactorSecret) throw new BadRequestException('No 2FA setup in progress. Call /auth/2fa/setup first.');

    const result = otplib.verifySync({ token: code, secret: user.twoFactorSecret });
    if (!result.valid) throw new BadRequestException('Invalid verification code. Try again.');

    await this.userRepo.update(userId, {
      twoFactorEnabled: true,
      twoFactorMethod: 'authenticator',
    });

    return { twoFactorEnabled: true, method: 'authenticator', message: 'Authenticator app enabled successfully' };
  }

  async verify2FALogin(tempToken: string, code: string) {
    if (!tempToken || !code) throw new BadRequestException('Missing tempToken or code');
    if (code.length !== 6) throw new BadRequestException('Invalid code format');

    let payload: any;
    try {
      payload = this.jwtService.verify(tempToken, { secret: process.env.JWT_SECRET || '' });
    } catch {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
    if (payload.purpose !== '2fa_verify') throw new UnauthorizedException('Invalid token purpose');

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.twoFactorEnabled || !user.twoFactorSecret) throw new BadRequestException('2FA is not enabled');

    const result = otplib.verifySync({ token: code, secret: user.twoFactorSecret });
    if (!result.valid) throw new BadRequestException('Invalid verification code');

    await this.userRepo.update(user.id, {
      loginAttempts: 0,
      lockUntil: undefined as any,
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
      status: user.status === UserStatus.PENDING_VERIFICATION ? user.status : UserStatus.ACTIVE,
    });

    const tokens = await this.generateTokens(user);
    await this.createSession(user.id, tokens.refreshToken);
    this.eventEmitter.emit('user.logged_in', { userId: user.id, email: user.email });
    return { user: this.sanitizeUser(user), tokens: { ...tokens, expiresIn: 900 } };
  }

  async disable2FA(userId: string, code: string) {
    if (!code || code.length !== 6) throw new BadRequestException('Invalid code format');
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.twoFactorEnabled) throw new BadRequestException('2FA is not enabled');
    if (!user.twoFactorSecret) throw new BadRequestException('No 2FA secret found');

    const result = otplib.verifySync({ token: code, secret: user.twoFactorSecret });
    if (!result.valid) throw new BadRequestException('Invalid verification code');

    await this.userRepo.update(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: undefined,
      twoFactorMethod: undefined,
    });

    return { twoFactorEnabled: false, message: 'Two-factor authentication disabled' };
  }

  private async createSession(userId: string, refreshToken: string, deviceId?: string, platform?: string, osVersion?: string, appVersion?: string) {
    const session = this.sessionRepo.create({ userId, refreshToken, deviceId: deviceId || uuid(), deviceType: platform, ipAddress: '0.0.0.0', expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isActive: true });
    return this.sessionRepo.save(session);
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m', secret: process.env.JWT_SECRET || '' }),
      this.jwtService.signAsync(payload, { expiresIn: '30d', secret: process.env.JWT_REFRESH_SECRET || '' }),
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

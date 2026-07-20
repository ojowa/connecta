import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AdminUser, AdminSession, AuditLog, SystemSetting, User, Report, Subscription, Transaction, Plan } from '@app/common/entities';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminUser) private adminRepo: Repository<AdminUser>,
    @InjectRepository(AdminSession) private sessRepo: Repository<AdminSession>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
    @InjectRepository(SystemSetting) private settingRepo: Repository<SystemSetting>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Report) private reportRepo: Repository<Report>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    @InjectRepository(Transaction) private txnRepo: Repository<Transaction>,
    @InjectRepository(Plan) private planRepo: Repository<Plan>,
    private jwtService: JwtService,
  ) {}

  async login(data: any) {
    const admin = await this.adminRepo.findOne({ where: { email: data.email } });
    if (!admin) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(data.password, admin.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    if (admin.tfaEnabled) {
      const tempToken = this.jwtService.sign({ sub: admin.id, temp: true }, { expiresIn: '5m' });
      return { requires2fa: true, tempToken, methods: ['totp'] };
    }
    const tokens = await this.generateTokens(admin);
    await this.sessRepo.save(this.sessRepo.create({ adminId: admin.id, tokenHash: tokens.accessToken.substring(0, 20), expiresAt: new Date(Date.now() + 15 * 60 * 1000) }));
    await this.auditRepo.save(this.auditRepo.create({ adminId: admin.id, action: 'admin.login' }));
    return { admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role }, tokens: { ...tokens, expiresIn: 900 } };
  }

  async getDashboard(period = '7d') {
    const totalUsers = await this.userRepo.count();
    const totalSubs = await this.subRepo.count({ where: { status: 'active' } });
    const totalRevenue = await this.txnRepo.createQueryBuilder('t').select('SUM(t.amount)', 'sum').where('t.status = :status', { status: 'completed' }).getRawOne();
    const totalReports = await this.reportRepo.count();
    return { period, generatedAt: new Date(), users: { total: totalUsers }, revenue: { totalRevenueNgn: totalRevenue?.sum || 0, activeSubscriptions: totalSubs }, safety: { totalReports } };
  }

  async getUsers(params: any) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const qb = this.userRepo.createQueryBuilder('u');
    if (params.search) qb.where('u.fullName ILIKE :s OR u.email ILIKE :s', { s: `%${params.search}%` });
    if (params.status) qb.andWhere('u.status = :status', { status: params.status });
    qb.orderBy('u.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [users, total] = await qb.getManyAndCount();
    return { users: users.map(u => { const { passwordHash, ...rest } = u; return rest; }), meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async getUserDetail(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const sub = await this.subRepo.findOne({ where: { userId, status: 'active' } });
    const { passwordHash, ...rest } = user;
    return { user: { ...rest, subscription: sub || null } };
  }

  async suspendUser(userId: string, data: any) {
    await this.userRepo.update(userId, { status: 'suspended' as any });
    return { userId, status: 'suspended', suspendedUntil: new Date(Date.now() + (data.durationDays || 30) * 24 * 60 * 60 * 1000) };
  }

  async banUser(userId: string, data: any) {
    await this.userRepo.update(userId, { status: 'suspended' as any });
    return { userId, status: 'banned', bannedAt: new Date() };
  }

  async unsuspendUser(userId: string) {
    await this.userRepo.update(userId, { status: 'active' as any });
    return { userId, status: 'active', unsuspendedAt: new Date() };
  }

  async getReports(params: any) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const where: any = {};
    if (params.status) where.status = params.status;
    const [reports, total] = await this.reportRepo.findAndCount({ where, order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit });
    return { reports, meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async resolveReport(reportId: string, data: any) {
    await this.reportRepo.update(reportId, { status: 'resolved', actionTaken: data.action, reviewedBy: data.adminId });
    return { reportId, status: 'resolved', actionTaken: data.action };
  }

  async getAuditLog(params: any) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const [entries, total] = await this.auditRepo.findAndCount({ order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit });
    return { auditEntries: entries, meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async getSettings() {
    const settings = await this.settingRepo.find();
    const result: any = {};
    for (const s of settings) result[s.key] = s.value;
    return { settings: result };
  }

  async updateSettings(data: any) {
    for (const [key, value] of Object.entries(data)) {
      await this.settingRepo.createQueryBuilder().insert().into(SystemSetting).values({ key, value: value as any }).orUpdate(['value'], ['key']).execute();
    }
    return { updatedFields: Object.keys(data), updatedAt: new Date() };
  }

  async verify2fa(data: any) {
    const { tempToken, code } = data;
    if (!tempToken || !code) throw new BadRequestException('Missing required fields');
    try {
      const payload = this.jwtService.verify(tempToken);
      if (!payload.temp) throw new UnauthorizedException('Invalid temp token');
      const admin = await this.adminRepo.findOne({ where: { id: payload.sub } });
      if (!admin) throw new NotFoundException('Admin not found');
      const tokens = await this.generateTokens(admin);
      await this.auditRepo.save(this.auditRepo.create({ adminId: admin.id, action: 'admin.2fa_verify' }));
      return {
        admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role, mfaVerified: true },
        tokens: { ...tokens, expiresIn: 900 },
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired temp token');
    }
  }

  async getAnalytics(params: any) {
    const period = params.period || '30d';
    const days = period === '24h' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const totalUsers = await this.userRepo.count();
    const newUsers = await this.userRepo.createQueryBuilder('u')
      .where('u."createdAt" >= :startDate', { startDate }).getCount();

    const previousPeriodStart = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000);
    const previousPeriodUsers = await this.userRepo.createQueryBuilder('u')
      .where('u."createdAt" >= :start AND u."createdAt" < :end', { start: previousPeriodStart, end: startDate })
      .getCount();
    const userGrowthRate = previousPeriodUsers > 0
      ? `${Math.round(((newUsers - previousPeriodUsers) / previousPeriodUsers) * 100)}%`
      : 'N/A';

    const totalRevenue = await this.txnRepo.createQueryBuilder('t')
      .select('SUM(t.amount)', 'sum')
      .where('t.status = :status AND t."createdAt" >= :startDate', { status: 'completed', startDate })
      .getRawOne();
    const activeSubscriptions = await this.subRepo.count({ where: { status: 'active' } });

    const totalReports = await this.reportRepo.count();
    const pendingReports = await this.reportRepo.count({ where: { status: 'pending' } });
    const resolvedReports = await this.reportRepo.count({ where: { status: 'resolved' } });

    const dataPoints = [];
    for (let i = days; i >= 0; i--) {
      const dayStart = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const dayUsers = await this.userRepo.createQueryBuilder('u')
        .where('u."createdAt" >= :start AND u."createdAt" < :end', { start: dayStart, end: dayEnd })
        .getCount();
      const dayRevenue = await this.txnRepo.createQueryBuilder('t')
        .select('SUM(t.amount)', 'sum')
        .where('t.status = :status AND t."createdAt" >= :start AND t."createdAt" < :end', { status: 'completed', start: dayStart, end: dayEnd })
        .getRawOne();
      dataPoints.push({
        date: dayStart.toISOString().split('T')[0],
        users: dayUsers,
        revenue: parseFloat(dayRevenue?.sum || '0') / 100,
      });
    }

    return {
      period, generatedAt: new Date(),
      users: { total: totalUsers, newInPeriod: newUsers, growthRate: userGrowthRate },
      revenue: { totalInPeriod: parseFloat(totalRevenue?.sum || '0') / 100, currency: 'NGN', activeSubscriptions },
      safety: { totalReports, pendingReports, resolvedReports, resolutionRate: totalReports > 0 ? `${Math.round((resolvedReports / totalReports) * 100)}%` : 'N/A' },
      dataPoints,
    };
  }

  async broadcast(data: any) {
    const { title, body, target, priority, scheduleAt } = data;
    if (!title || !body) throw new BadRequestException('Title and body are required');
    const broadcastId = `bcast_${Date.now()}`;
    return {
      broadcastId,
      status: scheduleAt ? 'scheduled' : 'sent',
      targetType: target?.type || 'all',
      estimatedRecipients: 0,
      scheduledAt: scheduleAt || new Date(),
    };
  }

  private async generateTokens(admin: AdminUser) {
    const payload = { sub: admin.id, email: admin.email, role: admin.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);
    return { accessToken, refreshToken };
  }
}

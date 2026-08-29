import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThan, IsNull } from 'typeorm';
import { AdminUser, User, Report, Notification, Subscription, Transaction, Plan, Like, Match, Message, Session, NotificationDelivery, Appeal, SystemSetting, Moment, MomentView, VerificationRequest, Profile, Photo } from '@app/common/entities';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('ADMIN_JWT_SECRET environment variable is not set');
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminUser) private adminRepo: Repository<AdminUser>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Report) private reportRepo: Repository<Report>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    @InjectRepository(Transaction) private txnRepo: Repository<Transaction>,
    @InjectRepository(Like) private likeRepo: Repository<Like>,
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @InjectRepository(Message) private msgRepo: Repository<Message>,
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
    @InjectRepository(Plan) private planRepo: Repository<Plan>,
    @InjectRepository(NotificationDelivery) private notifDeliveryRepo: Repository<NotificationDelivery>,
    @InjectRepository(Appeal) private appealRepo: Repository<Appeal>,
    @InjectRepository(SystemSetting) private settingsRepo: Repository<SystemSetting>,
    @InjectRepository(Moment) private momentRepo: Repository<Moment>,
    @InjectRepository(MomentView) private momentViewRepo: Repository<MomentView>,
    @InjectRepository(VerificationRequest) private verificationRepo: Repository<VerificationRequest>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(Photo) private photoRepo: Repository<Photo>,
  ) {}

  async login(email: string, password: string) {
    const admin = await this.adminRepo.findOne({ where: { email } });
    if (!admin) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const accessToken = jwt.sign({ sub: admin.id, email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: '24h' });
    return {
      admin: { id: admin.id, email: admin.email, name: admin.name || admin.email, role: admin.role, isActive: admin.isActive },
      tokens: { accessToken },
    };
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }

  async getDashboard(period?: string) {
    const totalUsers = await this.userRepo.count();
    const activeUsers = await this.userRepo.count({ where: { status: 'active' as any } });
    const totalReports = await this.reportRepo.count();
    const pendingReports = await this.reportRepo.count({ where: { status: 'pending' as any } });
    const activeSubscriptions = await this.subRepo.count({ where: { status: 'active' as any } });
    const totalTransactions = await this.txnRepo.count();

    let totalRevenueNgn = 0;
    try {
      const revenueResult = await this.txnRepo
        .createQueryBuilder('t')
        .select('SUM(t.amount)', 'total')
        .where('t.status = :status', { status: 'completed' })
        .getRawOne();
      totalRevenueNgn = parseFloat(revenueResult?.total) || 0;
    } catch {}

    return {
      users: { total: totalUsers, active: activeUsers, suspended: totalUsers - activeUsers },
      revenue: { totalRevenueNgn, activeSubscriptions, totalTransactions },
      safety: { totalReports, pendingReports },
    };
  }

  async getUsers(page = 1, limit = 20, status?: string) {
    const qb = this.userRepo.createQueryBuilder('u');
    if (status) qb.where('u.status = :status', { status });
    const [users, total] = await qb.orderBy('u.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getManyAndCount();
    return { users: users.map((u) => { const { passwordHash, ...rest } = u; return rest; }), meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async suspendUser(userId: string, reason: string) {
    await this.userRepo.update(userId, { status: 'suspended' as any });
    return { suspended: true, userId, reason };
  }

  async activateUser(userId: string) {
    await this.userRepo.update(userId, { status: 'active' as any });
    return { activated: true, userId };
  }

  async banUser(userId: string, reason: string) {
    await this.userRepo.update(userId, { status: 'banned' as any });
    return { banned: true, userId, reason };
  }

  async getUser(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...rest } = user;
    return { user: rest };
  }

  async getReports(page = 1, limit = 20) {
    const [reports, total] = await this.reportRepo.findAndCount({ order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit });
    return { reports, meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async resolveReport(reportId: string, data: { resolution: string; notes?: string; actionTaken?: string }) {
    await this.reportRepo.update(reportId, { status: data.resolution as any, actionTaken: data.actionTaken });
    return { resolved: true, reportId, resolution: data.resolution };
  }

  async broadcast(data: { title: string; message: string; type: string; targetAudience: string }) {
    const broadcastId = `bc_${Date.now()}`;
    return { broadcastId, status: 'sent', ...data };
  }

  async getStats() {
    const totalUsers = await this.userRepo.count();
    const activeUsers = await this.userRepo.count({ where: { status: 'active' as any } });
    const totalSubscriptions = await this.subRepo.count();
    const totalTransactions = await this.txnRepo.count();
    const totalReports = await this.reportRepo.count();
    return { totalUsers, activeUsers, totalSubscriptions, totalTransactions, totalReports };
  }

  private readonly SETTINGS_KEY = 'platform_settings';

  private readonly defaultSettings = {
    maintenanceMode: false,
    welcomeMessage: 'Welcome to OJChat!',
    minAge: 18,
    maxAge: 100,
    enableVideoCalls: true,
    enableVoiceCalls: true,
    enableSuperLikes: true,
    maxFreeSuperLikes: 5,
    paymentPlatform: 'paystack',
    paystack: { secretKey: '', publicKey: '', webhookSecret: '' },
    flutterwave: { secretKey: '', publicKey: '', webhookSecret: '' },
    storageProvider: 'local',
    storageLocal: { uploadDir: '', baseUrl: 'http://localhost:3006/media/files' },
    storageS3: { region: '', accessKeyId: '', secretAccessKey: '', bucket: '', endpoint: '' },
    storageR2: { accountId: '', accessKeyId: '', secretAccessKey: '', bucket: '', publicUrl: '' },
  };

  async getSettings() {
    const record = await this.settingsRepo.findOne({ where: { key: this.SETTINGS_KEY } });
    const db = record?.value || {};
    return { settings: { ...this.defaultSettings, ...db } };
  }

  async updateSettings(data: any) {
    const record = await this.settingsRepo.findOne({ where: { key: this.SETTINGS_KEY } });
    const current = record?.value || {};
    const updated = { ...current, ...data };
    if (record) {
      record.value = updated;
      await this.settingsRepo.save(record);
    } else {
      await this.settingsRepo.save(this.settingsRepo.create({ key: this.SETTINGS_KEY, value: updated, description: 'Platform settings managed by admin panel' }));
    }
    return { updatedAt: new Date().toISOString() };
  }

  async getAuditLog(page = 1, limit = 50) {
    return { auditEntries: [], meta: { page, limit, total: 0, hasMore: false } };
  }

  async getAnalytics(period?: string) {
    const periodDays = period === '24h' ? 1 : period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30;
    const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const totalUsers = await this.userRepo.count();
    const newUsers = await this.userRepo.createQueryBuilder('u').where('u.createdAt >= :since', { since }).getCount();
    const growthRate = totalUsers > 0 ? `${((newUsers / totalUsers) * 100).toFixed(1)}%` : '0%';

    const totalReports = await this.reportRepo.count();
    const pendingReports = await this.reportRepo.count({ where: { status: 'pending' as any } });
    const resolvedReports = await this.reportRepo.count({ where: { status: 'resolved' as any } });
    const resolutionRate = totalReports > 0 ? `${((resolvedReports / totalReports) * 100).toFixed(1)}%` : '0%';

    let totalRevenue = 0;
    try {
      const revenueResult = await this.txnRepo
        .createQueryBuilder('t')
        .select('SUM(t.amount)', 'total')
        .where('t.status = :status', { status: 'completed' })
        .andWhere('t.createdAt >= :since', { since })
        .getRawOne();
      totalRevenue = parseFloat(revenueResult?.total) || 0;
    } catch {}

    const activeSubscriptions = await this.subRepo.count({ where: { status: 'active' as any } });

    const dataPoints: Array<{ date: string; users: number; revenue: number }> = [];
    for (let i = periodDays; i >= 0; i--) {
      const dayStart = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const dayUsers = await this.userRepo.createQueryBuilder('u').where('u.createdAt >= :start AND u.createdAt < :end', { start: dayStart, end: dayEnd }).getCount();
      let dayRevenue = 0;
      try {
        const dayRev = await this.txnRepo
          .createQueryBuilder('t')
          .select('SUM(t.amount)', 'total')
          .where('t.status = :status', { status: 'completed' })
          .andWhere('t.createdAt >= :start AND t.createdAt < :end', { start: dayStart, end: dayEnd })
          .getRawOne();
        dayRevenue = parseFloat(dayRev?.total) || 0;
      } catch {}
      dataPoints.push({ date: dayStart.toISOString().split('T')[0], users: dayUsers, revenue: dayRevenue });
    }

    return {
      period: period || '30d',
      generatedAt: new Date().toISOString(),
      users: { total: totalUsers, newInPeriod: newUsers, growthRate },
      revenue: { totalInPeriod: totalRevenue, currency: 'NGN', activeSubscriptions },
      safety: { totalReports, pendingReports, resolvedReports, resolutionRate },
      dataPoints,
    };
  }

  async getLiveActivity() {
    const since5min = new Date(Date.now() - 5 * 60 * 1000);
    const since1h = new Date(Date.now() - 60 * 60 * 1000);
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [likes5min, matches1h, messages1h, activeSessions, reports24h, newUsers24h] = await Promise.all([
      this.likeRepo.count({ where: { createdAt: MoreThan(since5min) } }),
      this.matchRepo.count({ where: { matchedAt: MoreThan(since1h) } }),
      this.msgRepo.count({ where: { createdAt: MoreThan(since1h) } }),
      this.sessionRepo.count({ where: { isActive: true } }),
      this.reportRepo.count({ where: { createdAt: MoreThan(since24h) } }),
      this.userRepo.createQueryBuilder('u').where('u.createdAt >= :since', { since: since24h }).getCount(),
    ]);

    const recentMatches = await this.matchRepo.find({ order: { matchedAt: 'DESC' }, take: 10 });
    const matchUserIds = recentMatches.flatMap(m => [m.user1Id, m.user2Id]);
    const matchUsers = matchUserIds.length > 0 ? await this.userRepo.find({ where: { id: In(matchUserIds) } }) : [];
    const matchUserMap = new Map(matchUsers.map(u => [u.id, u]));

    return {
      counts: { likes5min, matches1h, messages1h, activeSessions, reports24h, newUsers24h },
      recentMatches: recentMatches.map(m => ({
        id: m.id,
        matchedAt: m.matchedAt,
        user1: matchUserMap.get(m.user1Id),
        user2: matchUserMap.get(m.user2Id),
      })),
    };
  }

  async getMatchAnalytics(period?: string) {
    const periodDays = period === '24h' ? 1 : period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const totalMatches = await this.matchRepo.createQueryBuilder('m').where('m.matchedAt >= :since', { since }).getCount();
    const totalLikes = await this.likeRepo.createQueryBuilder('l').where('l.createdAt >= :since', { since }).getCount();
    const totalUsers = await this.userRepo.count();

    const matchRate = totalLikes > 0 ? `${((totalMatches / totalLikes) * 100).toFixed(1)}%` : '0%';

    const dataPoints: Array<{ date: string; matches: number; likes: number }> = [];
    for (let i = periodDays; i >= 0; i--) {
      const dayStart = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const dayMatches = await this.matchRepo.createQueryBuilder('m').where('m.matchedAt >= :start AND m.matchedAt < :end', { start: dayStart, end: dayEnd }).getCount();
      const dayLikes = await this.likeRepo.createQueryBuilder('l').where('l.createdAt >= :start AND l.createdAt < :end', { start: dayStart, end: dayEnd }).getCount();
      dataPoints.push({ date: dayStart.toISOString().split('T')[0], matches: dayMatches, likes: dayLikes });
    }

    return {
      period: period || '30d',
      totalMatches,
      totalLikes,
      matchRate,
      totalUsers,
      dataPoints,
    };
  }

  async getRevenueDeepDive(period?: string) {
    const periodDays = period === '24h' ? 1 : period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    let totalRevenue = 0;
    let periodRevenue = 0;
    try {
      const totalResult = await this.txnRepo.createQueryBuilder('t').select('SUM(t.amount)', 'total').where('t.status = :status', { status: 'completed' }).getRawOne();
      totalRevenue = parseFloat(totalResult?.total) || 0;
      const periodResult = await this.txnRepo.createQueryBuilder('t').select('SUM(t.amount)', 'total').where('t.status = :status', { status: 'completed' }).andWhere('t.createdAt >= :since', { since }).getRawOne();
      periodRevenue = parseFloat(periodResult?.total) || 0;
    } catch {}

    const activeSubscriptions = await this.subRepo.count({ where: { status: 'active' as any } });
    const totalSubscriptions = await this.subRepo.count();

    let failedRevenue = 0;
    try {
      const failedResult = await this.txnRepo.createQueryBuilder('t').select('SUM(t.amount)', 'total').where('t.status = :status', { status: 'failed' }).andWhere('t.createdAt >= :since', { since }).getRawOne();
      failedRevenue = parseFloat(failedResult?.total) || 0;
    } catch {}
    const failedCount = await this.txnRepo.createQueryBuilder('t').where('t.status = :status', { status: 'failed' }).andWhere('t.createdAt >= :since', { since }).getCount();

    const dataPoints: Array<{ date: string; revenue: number; failed: number }> = [];
    for (let i = periodDays; i >= 0; i--) {
      const dayStart = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      let dayRevenue = 0;
      let dayFailed = 0;
      try {
        const dr = await this.txnRepo.createQueryBuilder('t').select('SUM(t.amount)', 'total').where('t.status = :status', { status: 'completed' }).andWhere('t.createdAt >= :start AND t.createdAt < :end', { start: dayStart, end: dayEnd }).getRawOne();
        dayRevenue = parseFloat(dr?.total) || 0;
        const df = await this.txnRepo.createQueryBuilder('t').select('SUM(t.amount)', 'total').where('t.status = :status', { status: 'failed' }).andWhere('t.createdAt >= :start AND t.createdAt < :end', { start: dayStart, end: dayEnd }).getRawOne();
        dayFailed = parseFloat(df?.total) || 0;
      } catch {}
      dataPoints.push({ date: dayStart.toISOString().split('T')[0], revenue: dayRevenue, failed: dayFailed });
    }

    return {
      period: period || '30d',
      totalRevenue,
      periodRevenue,
      failedRevenue,
      failedTransactions: failedCount,
      activeSubscriptions,
      totalSubscriptions,
      currency: 'NGN',
      dataPoints,
    };
  }

  async getGeoAnalytics() {
    const cityDistribution = await this.userRepo.createQueryBuilder('u')
      .select('p.city', 'city')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('profiles', 'p', 'p."userId" = u.id')
      .where('p.city IS NOT NULL')
      .groupBy('p.city')
      .orderBy('count', 'DESC')
      .limit(20)
      .getRawMany();

    const genderDistribution = await this.userRepo.createQueryBuilder('u')
      .select('p.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('profiles', 'p', 'p."userId" = u.id')
      .where('p.gender IS NOT NULL')
      .groupBy('p.gender')
      .getRawMany();

    const ageDistribution = await this.userRepo.createQueryBuilder('u')
      .select('FLOOR(EXTRACT(YEAR FROM AGE(u."dateOfBirth")) / 5) * 5', 'ageGroup')
      .addSelect('COUNT(*)', 'count')
      .where('u."dateOfBirth" IS NOT NULL')
      .groupBy('ageGroup')
      .orderBy('ageGroup', 'ASC')
      .getRawMany();

    const totalUsers = await this.userRepo.count();

    return { cityDistribution, genderDistribution, ageDistribution, totalUsers };
  }

  async getSystemHealth() {
    const services = [
      { name: 'auth-service', port: 3001 },
      { name: 'users-service', port: 3002 },
      { name: 'matching-service', port: 3003 },
      { name: 'chat-service', port: 3004 },
      { name: 'calls-service', port: 3005 },
      { name: 'media-service', port: 3006 },
      { name: 'payments-service', port: 3007 },
      { name: 'notifications-service', port: 3008 },
      { name: 'search-service', port: 3009 },
      { name: 'content-service', port: 3010 },
      { name: 'support-service', port: 3011 },
      { name: 'admin-service', port: 3012 },
    ];

    const checks = await Promise.all(
      services.map(async (s) => {
        try {
          const res = await fetch(`http://localhost:${s.port}/health`, { signal: AbortSignal.timeout(2000) });
          return { name: s.name, port: s.port, status: res.ok ? 'healthy' : 'degraded', statusCode: res.status };
        } catch {
          return { name: s.name, port: s.port, status: 'down', statusCode: 0 };
        }
      }),
    );

    const healthy = checks.filter(c => c.status === 'healthy').length;
    const degraded = checks.filter(c => c.status === 'degraded').length;
    const down = checks.filter(c => c.status === 'down').length;

    return { services: checks, summary: { total: checks.length, healthy, degraded, down } };
  }

  async getNotificationHistory(page = 1, limit = 50, filters?: { type?: string; status?: string; channel?: string; startDate?: string; endDate?: string }) {
    const qb = this.notifDeliveryRepo.createQueryBuilder('nd');

    if (filters?.type) qb.andWhere('nd.type = :type', { type: filters.type });
    if (filters?.status) qb.andWhere('nd.status = :status', { status: filters.status });
    if (filters?.channel) qb.andWhere('nd.channel = :channel', { channel: filters.channel });
    if (filters?.startDate) qb.andWhere('nd.createdAt >= :startDate', { startDate: new Date(filters.startDate) });
    if (filters?.endDate) qb.andWhere('nd.createdAt <= :endDate', { endDate: new Date(filters.endDate) });

    const [notifications, total] = await qb
      .orderBy('nd.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      notifications,
      meta: { page, limit, total, hasMore: total > page * limit },
    };
  }

  async getNotificationAnalytics(period = '30d') {
    const days = period === '24h' ? 1 : period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const total = await this.notifDeliveryRepo.createQueryBuilder('nd')
      .where('nd.createdAt >= :since', { since }).getCount();

    const delivered = await this.notifDeliveryRepo.createQueryBuilder('nd')
      .where('nd.createdAt >= :since AND nd.delivered = true', { since }).getCount();

    const opened = await this.notifDeliveryRepo.createQueryBuilder('nd')
      .where('nd.createdAt >= :since AND nd.opened = true', { since }).getCount();

    const clicked = await this.notifDeliveryRepo.createQueryBuilder('nd')
      .where('nd.createdAt >= :since AND nd.clicked = true', { since }).getCount();

    const failed = await this.notifDeliveryRepo.createQueryBuilder('nd')
      .where('nd.createdAt >= :since AND nd.status = :status', { since, status: 'failed' }).getCount();

    const byType = await this.notifDeliveryRepo.createQueryBuilder('nd')
      .select('nd.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(CASE WHEN nd.delivered = true THEN 1 ELSE 0 END)', 'delivered')
      .addSelect('SUM(CASE WHEN nd.opened = true THEN 1 ELSE 0 END)', 'opened')
      .addSelect('SUM(CASE WHEN nd.clicked = true THEN 1 ELSE 0 END)', 'clicked')
      .where('nd.createdAt >= :since', { since })
      .groupBy('nd.type')
      .getRawMany();

    const byChannel = await this.notifDeliveryRepo.createQueryBuilder('nd')
      .select('nd.channel', 'channel')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(CASE WHEN nd.delivered = true THEN 1 ELSE 0 END)', 'delivered')
      .where('nd.createdAt >= :since', { since })
      .groupBy('nd.channel')
      .getRawMany();

    const byPlatform = await this.notifDeliveryRepo.createQueryBuilder('nd')
      .select('nd.platform', 'platform')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(CASE WHEN nd.delivered = true THEN 1 ELSE 0 END)', 'delivered')
      .where('nd.createdAt >= :since', { since })
      .groupBy('nd.platform')
      .getRawMany();

    const daily = await this.notifDeliveryRepo.createQueryBuilder('nd')
      .select("DATE(nd.createdAt)", 'date')
      .addSelect('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN nd.delivered = true THEN 1 ELSE 0 END)', 'delivered')
      .addSelect('SUM(CASE WHEN nd.opened = true THEN 1 ELSE 0 END)', 'opened')
      .addSelect('SUM(CASE WHEN nd.clicked = true THEN 1 ELSE 0 END)', 'clicked')
      .addSelect('SUM(CASE WHEN nd.status = \'failed\' THEN 1 ELSE 0 END)', 'failed')
      .where('nd.createdAt >= :since', { since })
      .groupBy("DATE(nd.createdAt)")
      .orderBy("DATE(nd.createdAt)", 'ASC')
      .getRawMany();

    return {
      period,
      summary: {
        total,
        delivered,
        opened,
        clicked,
        failed,
        deliveryRate: total ? ((delivered / total) * 100).toFixed(1) : '0',
        openRate: delivered ? ((opened / delivered) * 100).toFixed(1) : '0',
        clickRate: opened ? ((clicked / opened) * 100).toFixed(1) : '0',
      },
      byType,
      byChannel,
      byPlatform,
      daily,
    };
  }

  async getNotificationDetail(id: string) {
    const notification = await this.notifDeliveryRepo.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async getSubscriptions(page = 1, limit = 50, filters?: { status?: string; planId?: string; search?: string }) {
    const qb = this.subRepo.createQueryBuilder('s')
      .leftJoinAndSelect('s.plan', 'plan');

    if (filters?.status) qb.andWhere('s.status = :status', { status: filters.status });
    if (filters?.planId) qb.andWhere('s.planId = :planId', { planId: filters.planId });
    if (filters?.search) {
      qb.andWhere('s.userId IN (SELECT id FROM users WHERE email ILIKE :search OR fullName ILIKE :search)', { search: `%${filters.search}%` });
    }

    const [subscriptions, total] = await qb
      .orderBy('s.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const subsWithUser = await Promise.all(
      subscriptions.map(async (s) => {
        const user = await this.userRepo.findOne({ where: { id: s.userId }, select: ['id', 'email', 'fullName'] });
        return { ...s, user };
      }),
    );

    return {
      subscriptions: subsWithUser,
      meta: { page, limit, total, hasMore: total > page * limit },
    };
  }

  async getSubscriptionDetail(id: string) {
    const sub = await this.subRepo.findOne({ where: { id }, relations: ['plan'] });
    if (!sub) throw new NotFoundException('Subscription not found');
    const user = await this.userRepo.findOne({ where: { id: sub.userId }, select: ['id', 'email', 'fullName', 'phone'] });
    const transactions = await this.txnRepo.find({ where: { subscriptionId: id }, order: { createdAt: 'DESC' }, take: 20 });
    return { subscription: sub, user, transactions };
  }

  async cancelSubscription(id: string, reason?: string) {
    const sub = await this.subRepo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subscription not found');
    sub.status = 'cancelled';
    sub.cancelledAt = new Date();
    sub.autoRenew = false;
    await this.subRepo.save(sub);

    const txn = this.txnRepo.create({
      userId: sub.userId,
      subscriptionId: sub.id,
      type: 'cancellation',
      amount: 0,
      status: 'completed',
      metadata: { reason: reason || 'Cancelled by admin' },
      completedAt: new Date(),
    });
    await this.txnRepo.save(txn);

    return { cancelled: true, subscription: sub };
  }

  async refundSubscription(id: string, reason?: string) {
    const sub = await this.subRepo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subscription not found');

    const lastPayment = await this.txnRepo.findOne({
      where: { subscriptionId: id, type: 'subscription', status: 'completed' },
      order: { createdAt: 'DESC' },
    });

    sub.status = 'refunded';
    sub.cancelledAt = new Date();
    sub.autoRenew = false;
    await this.subRepo.save(sub);

    const refundTxn = this.txnRepo.create({
      userId: sub.userId,
      subscriptionId: sub.id,
      type: 'refund',
      amount: lastPayment ? lastPayment.amount : 0,
      currency: lastPayment ? lastPayment.currency : 'NGN',
      status: 'completed',
      metadata: { reason: reason || 'Refunded by admin', originalPaymentId: lastPayment?.id },
      completedAt: new Date(),
    });
    await this.txnRepo.save(refundTxn);

    return { refunded: true, subscription: sub, refundAmount: refundTxn.amount };
  }

  async grantPremium(userId: string, planId: string, durationDays = 30) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const now = new Date();
    const sub = this.subRepo.create({
      userId,
      planId,
      status: 'active',
      billingPeriod: 'monthly',
      startedAt: now,
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000),
      autoRenew: false,
    });
    await this.subRepo.save(sub);

    const txn = this.txnRepo.create({
      userId,
      subscriptionId: sub.id,
      type: 'admin_grant',
      amount: 0,
      status: 'completed',
      metadata: { grantedBy: 'admin', planName: plan.displayName, durationDays },
      completedAt: new Date(),
    });
    await this.txnRepo.save(txn);

    return { granted: true, subscription: sub, plan: plan.displayName, expiresAt: sub.currentPeriodEnd };
  }

  async getSubscriptionAnalytics(period = '30d') {
    const days = period === '24h' ? 1 : period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const totalActive = await this.subRepo.count({ where: { status: 'active' } });
    const totalCancelled = await this.subRepo.count({ where: { status: 'cancelled' } });
    const totalRefunded = await this.subRepo.count({ where: { status: 'refunded' } });

    const newSubscriptions = await this.subRepo.createQueryBuilder('s')
      .where('s.createdAt >= :since', { since }).getCount();

    const cancellations = await this.subRepo.createQueryBuilder('s')
      .where('s.cancelledAt >= :since AND s.status = :status', { since, status: 'cancelled' }).getCount();

    const refunds = await this.txnRepo.createQueryBuilder('t')
      .where('t.createdAt >= :since AND t.type = :type', { since, type: 'refund' }).getCount();

    const revenue = await this.txnRepo.createQueryBuilder('t')
      .where('t.createdAt >= :since AND t.type = :type AND t.status = :status', { since, type: 'subscription', status: 'completed' })
      .select('SUM(t.amount)', 'total')
      .getRawOne();

    const refundAmount = await this.txnRepo.createQueryBuilder('t')
      .where('t.createdAt >= :since AND t.type = :type', { since, type: 'refund' })
      .select('SUM(t.amount)', 'total')
      .getRawOne();

    const byPlan = await this.subRepo.createQueryBuilder('s')
      .leftJoin('s.plan', 'plan')
      .select('plan.displayName', 'planName')
      .addSelect('COUNT(*)', 'count')
      .addSelect("SUM(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END)", 'active')
      .groupBy('plan.displayName')
      .getRawMany();

    const daily = await this.subRepo.createQueryBuilder('s')
      .select("DATE(s.createdAt)", 'date')
      .addSelect('COUNT(*)', 'new')
      .where('s.createdAt >= :since', { since })
      .groupBy("DATE(s.createdAt)")
      .orderBy("DATE(s.createdAt)", 'ASC')
      .getRawMany();

    return {
      period,
      summary: {
        totalActive,
        totalCancelled,
        totalRefunded,
        newSubscriptions,
        cancellations,
        refunds,
        netRevenue: Number(revenue?.total || 0) - Number(refundAmount?.total || 0),
        refundAmount: Number(refundAmount?.total || 0),
      },
      byPlan,
      daily,
    };
  }

  async getAllPlans() {
    return this.planRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async createPlan(data: any) {
    const plan = this.planRepo.create({
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      tagline: data.tagline,
      isPopular: data.isPopular || false,
      priceMonthly: data.priceMonthly,
      priceYearly: data.priceYearly,
      currency: data.currency || 'NGN',
      features: data.features || [],
      dailyLikes: data.dailyLikes,
      dailySuperLikes: data.dailySuperLikes,
      isActive: data.isActive !== false,
      sortOrder: data.sortOrder || 0,
    });
    return this.planRepo.save(plan);
  }

  async updatePlan(planId: string, data: any) {
    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');
    Object.assign(plan, data);
    return this.planRepo.save(plan);
  }

  async deletePlan(planId: string) {
    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');
    if (plan.name === 'free') throw new BadRequestException('Cannot delete the free plan');
    const activeSubs = await this.subRepo.count({ where: { planId, status: 'active' } });
    if (activeSubs > 0) throw new BadRequestException(`Cannot delete plan with ${activeSubs} active subscribers. Deactivate it instead.`);
    await this.planRepo.remove(plan);
    return { deleted: true };
  }

  async getAppeals(page = 1, limit = 20, status?: string) {
    const qb = this.appealRepo.createQueryBuilder('a');
    if (status) qb.where('a.status = :status', { status });
    const [appeals, total] = await qb
      .orderBy('a.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const appealsWithUser = await Promise.all(
      appeals.map(async (a) => {
        const user = await this.userRepo.findOne({ where: { id: a.userId }, select: ['id', 'email', 'fullName', 'phone', 'status'] });
        return { ...a, user };
      }),
    );

    return {
      appeals: appealsWithUser,
      meta: { page, limit, total, hasMore: total > page * limit },
    };
  }

  async reviewAppeal(appealId: string, data: { decision: string; notes?: string }, adminId: string) {
    const appeal = await this.appealRepo.findOne({ where: { id: appealId } });
    if (!appeal) throw new NotFoundException('Appeal not found');
    if (appeal.status !== 'pending') throw new Error('This appeal has already been reviewed');

    const { decision, notes } = data;
    await this.appealRepo.update(appealId, {
      status: 'reviewed',
      decision,
      decisionNotes: notes,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    });

    if (decision === 'approved') {
      await this.userRepo.update(appeal.userId, { status: 'active' as any });
    }

    return { reviewed: true, decision, appealId };
  }

  async getMoments(page = 1, limit = 50, userId?: string) {
    const where: any = userId ? { userId, deletedAt: IsNull() } : { deletedAt: IsNull() };
    const [moments, total] = await this.momentRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const userIds = [...new Set(moments.map((m) => m.userId))];
    const users = userIds.length > 0 ? await this.userRepo.find({ where: { id: In(userIds) }, select: ['id', 'fullName', 'email'] }) : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const momentIds = moments.map((m) => m.id);
    const viewCounts = momentIds.length > 0
      ? await this.momentViewRepo.createQueryBuilder('mv')
        .select('mv."momentId"', 'momentId')
        .addSelect('COUNT(*)', 'views')
        .where('mv."momentId" IN (:...ids)', { ids: momentIds })
        .groupBy('mv."momentId"')
        .getRawMany()
      : [];
    const viewMap = new Map(viewCounts.map((v: any) => [v.momentId, parseInt(v.views)]));

    return {
      moments: moments.map((m) => ({
        ...m,
        user: userMap.get(m.userId) || null,
        viewCount: viewMap.get(m.id) || 0,
        expired: new Date(m.expiresAt) <= new Date(),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async deleteMoment(momentId: string) {
    const moment = await this.momentRepo.findOne({ where: { id: momentId, deletedAt: IsNull() } });
    if (!moment) throw new NotFoundException('Moment not found');
    await this.momentViewRepo.delete({ momentId });
    await this.momentRepo.softDelete(momentId);
    return { deleted: true };
  }

  async getMomentStats() {
    const total = await this.momentRepo.count({ where: { deletedAt: IsNull() } });
    const active = await this.momentRepo.count({ where: { expiresAt: MoreThan(new Date()), deletedAt: IsNull() } });
    const expired = total - active;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await this.momentRepo.count({ where: { createdAt: MoreThan(today), deletedAt: IsNull() } });

    return { total, active, expired, todayCount };
  }

  async getVerificationRequests(page = 1, limit = 20, status?: string) {
    const where: any = {};
    if (status) where.status = status;

    const [requests, total] = await this.verificationRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const userIds = [...new Set(requests.map((r) => r.userId))];
    const users = await this.userRepo.find({ where: { id: In(userIds) } });
    const profiles = await this.profileRepo.find({ where: { userId: In(userIds) } });
    const userMap = new Map(users.map((u) => [u.id, u]));
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));

    const requestsWithDetails = await Promise.all(requests.map(async (r) => {
      const user = userMap.get(r.userId);
      const profile = profileMap.get(r.userId);
      const photos = await this.photoRepo.find({ where: { profileId: profile?.id || '' }, order: { order: 'ASC' } });
      return {
        ...r,
        user: user ? { id: user.id, fullName: user.fullName, email: user.email } : null,
        profilePhotos: photos.map((p) => p.url),
      };
    }));

    return {
      requests: requestsWithDetails,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getVerificationStats() {
    const total = await this.verificationRepo.count();
    const pending = await this.verificationRepo.count({ where: { status: 'pending' } });
    const approved = await this.verificationRepo.count({ where: { status: 'approved' } });
    const rejected = await this.verificationRepo.count({ where: { status: 'rejected' } });
    return { total, pending, approved, rejected };
  }

  async reviewVerification(requestId: string, adminId: string, action: 'approved' | 'rejected', reason?: string) {
    const request = await this.verificationRepo.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Verification request not found');
    if (request.status !== 'pending') throw new BadRequestException('Request already reviewed');

    request.status = action;
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    if (reason) request.rejectionReason = reason;
    await this.verificationRepo.save(request);

    if (action === 'approved') {
      const profile = await this.profileRepo.findOne({ where: { userId: request.userId } });
      if (profile) {
        profile.verified = true;
        profile.verifiedAt = new Date();
        await this.profileRepo.save(profile);
      }
    }

    return { request, profileVerified: action === 'approved' };
  }
}


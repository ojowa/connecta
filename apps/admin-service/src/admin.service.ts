import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser, User, Report, Notification, Subscription, Transaction, Plan } from '@app/common/entities';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'connecta_admin_secret_key';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminUser) private adminRepo: Repository<AdminUser>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Report) private reportRepo: Repository<Report>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    @InjectRepository(Transaction) private txnRepo: Repository<Transaction>,
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

  private defaultSettings = {
    maintenanceMode: false,
    welcomeMessage: 'Welcome to Connecta!',
    minAge: 18,
    maxAge: 100,
    enableVideoCalls: true,
    enableVoiceCalls: true,
    enableSuperLikes: true,
    maxFreeSuperLikes: 5,
  };

  async getSettings() {
    return { settings: this.defaultSettings };
  }

  async updateSettings(data: any) {
    Object.assign(this.defaultSettings, data);
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
}

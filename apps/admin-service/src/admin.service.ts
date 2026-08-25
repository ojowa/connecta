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

  async getReports(page = 1, limit = 20) {
    const [reports, total] = await this.reportRepo.findAndCount({ order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit });
    return { reports, meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async getStats() {
    const totalUsers = await this.userRepo.count();
    const activeUsers = await this.userRepo.count({ where: { status: 'active' as any } });
    const totalSubscriptions = await this.subRepo.count();
    const totalTransactions = await this.txnRepo.count();
    const totalReports = await this.reportRepo.count();
    return { totalUsers, activeUsers, totalSubscriptions, totalTransactions, totalReports };
  }
}

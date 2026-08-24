import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser, User, Report, Notification, Subscription, Transaction, Plan } from '@app/common/entities';
import * as bcrypt from 'bcryptjs';

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
    return { admin: { id: admin.id, email: admin.email, role: admin.role }, token: `admin_token_${Date.now()}` };
  }

  async getDashboard() {
    const totalUsers = await this.userRepo.count();
    const activeUsers = await this.userRepo.count({ where: { status: 'active' as any } });
    const totalReports = await this.reportRepo.count();
    const pendingReports = await this.reportRepo.count({ where: { status: 'pending' as any } });
    return { totalUsers, activeUsers, totalReports, pendingReports };
  }

  async getUsers(page = 1, limit = 20, status?: string) {
    const qb = this.userRepo.createQueryBuilder('u');
    if (status) qb.where('u.status = :status', { status });
    const users = await qb.orderBy('u.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getMany();
    return { users: users.map((u) => { const { passwordHash, ...rest } = u; return rest; }), meta: { page, limit } };
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
    return { reports, meta: { page, limit, total } };
  }

  async getStats() {
    const totalUsers = await this.userRepo.count();
    const totalSubscriptions = await this.subRepo.count();
    const totalTransactions = await this.txnRepo.count();
    return { totalUsers, totalSubscriptions, totalTransactions };
  }
}

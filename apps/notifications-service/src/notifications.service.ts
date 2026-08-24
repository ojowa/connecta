import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationPreference, DeviceToken } from '@app/common/entities';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(NotificationPreference) private prefRepo: Repository<NotificationPreference>,
    @InjectRepository(DeviceToken) private tokenRepo: Repository<DeviceToken>,
  ) {}

  async getNotifications(userId: string, page = 1, limit = 20) {
    const [notifications, total] = await this.notifRepo.findAndCount({ where: { userId }, order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit });
    const unreadCount = await this.notifRepo.createQueryBuilder('n').where('n.userId = :userId', { userId }).andWhere('n.readAt IS NULL').getCount();
    return { notifications, unreadCount, meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async getPreferences(userId: string) {
    let prefs = await this.prefRepo.findOne({ where: { userId } });
    if (!prefs) { prefs = this.prefRepo.create({ userId }); await this.prefRepo.save(prefs); }
    return prefs;
  }

  async updatePreferences(userId: string, data: any) {
    let prefs = await this.prefRepo.findOne({ where: { userId } });
    if (!prefs) { prefs = this.prefRepo.create({ userId }); Object.assign(prefs, data); }
    else { Object.assign(prefs, data); }
    await this.prefRepo.save(prefs);
    return prefs;
  }

  async markAsRead(userId: string, data: any) {
    if (data.markAs === 'all') {
      await this.notifRepo.createQueryBuilder().update(Notification).set({ readAt: new Date() }).where('userId = :userId AND readAt IS NULL', { userId }).execute();
    } else if (data.notificationIds?.length) {
      await this.notifRepo.createQueryBuilder().update(Notification).set({ readAt: new Date() }).where('id IN (:...ids) AND userId = :userId', { ids: data.notificationIds, userId }).execute();
    }
    return { marked: true };
  }

  async registerDevice(userId: string, data: any) {
    const existing = await this.tokenRepo.findOne({ where: { token: data.token } });
    if (existing) { await this.tokenRepo.update(existing.id, { userId, platform: data.platform }); return existing; }
    const deviceToken = this.tokenRepo.create({ userId, token: data.token, platform: data.platform });
    return this.tokenRepo.save(deviceToken);
  }
}

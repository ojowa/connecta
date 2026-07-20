import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationPreference } from '@app/common/entities';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(NotificationPreference) private prefRepo: Repository<NotificationPreference>,
  ) {}

  async getNotifications(userId: string, page = 1, limit = 20, filter = 'all') {
    const where: any = { userId };
    if (filter === 'unread') where.status = 'pending';
    else if (filter === 'read') where.readAt = { $ne: null } as any;
    const [notifications, total] = await this.notifRepo.findAndCount({ where, order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit });
      const unreadCount = await this.notifRepo.count({ where: { userId, readAt: undefined as any } });
    return { notifications: notifications.map(n => ({ id: n.id, type: n.type, title: n.title, body: n.body, data: n.data, read: !!n.readAt, createdAt: n.createdAt })), unreadCount, meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async getPreferences(userId: string) {
    let prefs = await this.prefRepo.findOne({ where: { userId } });
    if (!prefs) { prefs = this.prefRepo.create({ userId }); await this.prefRepo.save(prefs); }
    return prefs;
  }

  async updatePreferences(userId: string, data: any) {
    let prefs = await this.prefRepo.findOne({ where: { userId } });
    if (!prefs) prefs = this.prefRepo.create({ userId });
    Object.assign(prefs, data);
    return this.prefRepo.save(prefs);
  }

  async markAsRead(userId: string, data: any) {
    if (data.markAll) {
      await this.notifRepo.update({ userId, readAt: undefined as any }, { readAt: new Date() });
      return { markedRead: 0, unreadCount: 0 };
    }
    if (data.notificationIds?.length) {
      await this.notifRepo.update(data.notificationIds, { readAt: new Date() });
    const unreadCount = await this.notifRepo.count({ where: { userId, readAt: undefined as any } });
      return { markedRead: data.notificationIds.length, unreadCount };
    }
    return { markedRead: 0, unreadCount: 0 };
  }

  async send(data: any) {
    const notif = await this.notifRepo.save(this.notifRepo.create({ userId: data.userId, type: data.type, title: data.title, body: data.body, data: data.data, channel: data.channel || 'push', status: 'sent', sentAt: new Date() }));
    return notif;
  }
}

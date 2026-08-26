import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationPreference, DeviceToken, NotificationDelivery } from '@app/common/entities';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(NotificationPreference) private prefRepo: Repository<NotificationPreference>,
    @InjectRepository(DeviceToken) private tokenRepo: Repository<DeviceToken>,
    @InjectRepository(NotificationDelivery) private deliveryRepo: Repository<NotificationDelivery>,
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

  async trackDelivery(data: { notificationId: string; userId: string; type: string; title: string; body: string; channel?: string; platform?: string; metadata?: any }) {
    const delivery = this.deliveryRepo.create({
      notificationId: data.notificationId,
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      channel: data.channel || 'push',
      platform: data.platform,
      status: 'sent',
      delivered: true,
      deliveredAt: new Date(),
      metadata: data.metadata,
    });
    return this.deliveryRepo.save(delivery);
  }

  async markDelivered(id: string) {
    await this.deliveryRepo.update(id, { delivered: true, deliveredAt: new Date(), status: 'delivered' });
    return { updated: true };
  }

  async markOpened(id: string) {
    await this.deliveryRepo.update(id, { opened: true, openedAt: new Date() });
    return { updated: true };
  }

  async markClicked(id: string) {
    await this.deliveryRepo.update(id, { clicked: true, clickedAt: new Date() });
    return { updated: true };
  }

  async markFailed(id: string, reason: string) {
    await this.deliveryRepo.update(id, { status: 'failed', failureReason: reason });
    return { updated: true };
  }
}

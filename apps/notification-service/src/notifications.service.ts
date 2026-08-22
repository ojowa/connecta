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
    const [notifications, total] = await this.notifRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const unreadCount = await this.notifRepo.count({ where: { userId, readAt: undefined as any } });
    return {
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        data: n.data,
        read: !!n.readAt,
        createdAt: n.createdAt,
      })),
      unreadCount,
      meta: { page, limit, total, hasMore: total > page * limit },
    };
  }

  async getPreferences(userId: string) {
    let prefs = await this.prefRepo.findOne({ where: { userId } });
    if (!prefs) {
      prefs = this.prefRepo.create({ userId });
      await this.prefRepo.save(prefs);
    }
    return prefs;
  }

  async updatePreferences(userId: string, data: any) {
    let prefs = await this.prefRepo.findOne({ where: { userId } });
    if (!prefs) prefs = this.prefRepo.create({ userId });
    Object.assign(prefs, data);
    return this.prefRepo.save(prefs);
  }

  async markAsRead(userId: string, data: any) {
    if (data.markAs === 'all' || data.markAll) {
      const result = await this.notifRepo.update(
        { userId, readAt: undefined as any },
        { readAt: new Date() },
      );
      const unreadCount = await this.notifRepo.count({
        where: { userId, readAt: undefined as any },
      });
      return { markedRead: result.affected || 0, unreadCount };
    }
    if (data.notificationIds?.length) {
      await this.notifRepo.update(data.notificationIds, { readAt: new Date() });
      const unreadCount = await this.notifRepo.count({
        where: { userId, readAt: undefined as any },
      });
      return { markedRead: data.notificationIds.length, unreadCount };
    }
    return { markedRead: 0, unreadCount: 0 };
  }

  async send(data: any) {
    const notif = await this.notifRepo.save(
      this.notifRepo.create({
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data,
        channel: data.channel || 'push',
        status: 'sent',
        sentAt: new Date(),
      }),
    );

    // In production, send via Firebase Cloud Messaging:
    // import * as admin from 'firebase-admin';
    // if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    // await admin.messaging().sendEach([{
    //   token: data.deviceToken,
    //   notification: { title: data.title, body: data.body },
    //   data: data.data ? Object.fromEntries(Object.entries(data.data).map(([k, v]) => [k, String(v)])) : undefined,
    //   android: { priority: 'high', notification: { channelId: data.type || 'general' } },
    //   apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    // }]);

    return notif;
  }

  async broadcast(data: any) {
    const { title, body, type, targetUserIds, targetAudience } = data;
    if (!title || !body) throw new Error('Title and body are required');

    // In production, fetch target user device tokens and send via FCM:
    // const tokens = targetUserIds
    //   ? await this.deviceTokenRepo.find({ where: { userId: In(targetUserIds) } })
    //   : await this.deviceTokenRepo.find();
    // const messages = tokens.map(t => ({
    //   token: t.token,
    //   notification: { title, body },
    //   data: { type: type || 'info', broadcast: 'true' },
    // }));
    // const result = await admin.messaging().sendEach(messages);

    const broadcastId = `bcast_${Date.now()}`;

    // Save broadcast to DB for tracking
    // await this.broadcastRepo.save({ id: broadcastId, title, body, type, targetAudience, sentAt: new Date() });

    return {
      broadcastId,
      status: 'sent',
      type: type || 'info',
      targetType: targetAudience || (targetUserIds ? 'segment' : 'all'),
      estimatedRecipients: targetUserIds?.length || 0,
      sentAt: new Date(),
    };
  }

  async registerDeviceToken(
    userId: string,
    data: { token: string; platform: string; deviceId?: string },
  ) {
    return { success: true, userId, platform: data.platform };
  }
}

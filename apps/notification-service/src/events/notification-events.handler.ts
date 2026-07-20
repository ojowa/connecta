import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, User } from '@app/common/entities';
import { NOTIFICATION_EVENTS } from '@app/common/constants/events';

@Injectable()
export class NotificationEventsHandler {
  private readonly logger = new Logger('NotificationEventsHandler');

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async handleNotificationSent(payload: { notificationId: string; userId: string; type: string }) {
    this.logger.log(`Handling notification.sent: ${payload.notificationId}`);

    await this.notificationRepository.update(payload.notificationId, {
      status: 'sent',
      sentAt: new Date(),
    });
  }

  async handleNotificationRead(payload: { notificationId: string; userId: string }) {
    this.logger.log(`Handling notification.read: ${payload.notificationId}`);

    await this.notificationRepository.update(payload.notificationId, {
      readAt: new Date(),
    });
  }

  async handleNotificationClicked(payload: { notificationId: string; userId: string }) {
    this.logger.log(`Handling notification.clicked: ${payload.notificationId}`);

    const notification = await this.notificationRepository.findOne({
      where: { id: payload.notificationId },
    });

    if (notification && !notification.readAt) {
      await this.notificationRepository.update(payload.notificationId, {
        readAt: new Date(),
      });
    }
  }
}

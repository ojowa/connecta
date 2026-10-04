import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';

export interface NotificationEvent {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: any;
}

export class NotificationEventsHandler {
  private readonly logger = new Logger(NotificationEventsHandler.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('notification.send')
  async handleNotificationSend(event: NotificationEvent) {
    try {
      await this.notificationsService.createAndPush(
        event.userId, event.type, event.title, event.body, event.data,
      );
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error}`);
    }
  }

  @OnEvent('notification.send_bulk')
  async handleBulkNotificationSend(events: NotificationEvent[]) {
    for (const event of events) {
      try {
        await this.notificationsService.createAndPush(
          event.userId, event.type, event.title, event.body, event.data,
        );
      } catch (error) {
        this.logger.error(`Failed to send bulk notification: ${error}`);
      }
    }
  }
}

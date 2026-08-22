import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationEventsHandler } from './notification-events.handler';
import { Notification, NotificationPreference, User, DeviceToken } from '@app/common/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, NotificationPreference, User, DeviceToken])],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationEventsHandler],
  exports: [NotificationsService],
})
export class NotificationsModule {}

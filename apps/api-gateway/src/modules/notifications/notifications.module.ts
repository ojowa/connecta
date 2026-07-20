import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [HttpModule],
  controllers: [NotificationsController],
})
export class NotificationsModule {}

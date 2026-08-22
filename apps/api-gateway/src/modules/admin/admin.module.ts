import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ModerationEventsHandler } from './moderation-events.handler';
import {
  AdminUser, AdminSession, AuditLog, User, Profile,
  SystemSetting, Report, Notification, Subscription, Transaction, Plan,
} from '@app/common/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminUser, AdminSession, AuditLog, User, Profile,
      SystemSetting, Report, Notification, Subscription, Transaction, Plan,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'connecta-dev-jwt-secret-2026',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, ModerationEventsHandler],
  exports: [AdminService],
})
export class AdminModule {}

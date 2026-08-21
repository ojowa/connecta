import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ModerationEventsHandler } from './events/moderation-events.handler';
import { AdminUser, AdminSession, AuditLog, SystemSetting, User, Report, Subscription, Transaction, Plan, Profile, Notification, Photo } from '@app/common/entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres', host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres', password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'connecta_db', autoLoadEntities: true, synchronize: false,
    }),
    TypeOrmModule.forFeature([AdminUser, AdminSession, AuditLog, SystemSetting, User, Report, Subscription, Transaction, Plan, Profile, Notification, Photo]),
    JwtModule.register({ secret: process.env.JWT_SECRET || '', signOptions: { expiresIn: '15m' } }),
  ],
  controllers: [AdminController],
  providers: [AdminService, ModerationEventsHandler],
})
export class AppModule {}

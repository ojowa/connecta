import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUser, AdminSession, AuditLog, User, Profile, SystemSetting, Report, Notification, Subscription, Transaction, Plan } from '@app/common/entities';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

const entities = [AdminUser, AdminSession, AuditLog, User, Profile, SystemSetting, Report, Notification, Subscription, Transaction, Plan];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'connecta_user',
      password: process.env.DB_PASSWORD || 'connecta_password',
      database: process.env.DB_NAME || 'connecta_db',
      entities,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature(entities),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AppModule {}

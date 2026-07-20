import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminUser, AdminSession, AuditLog, SystemSetting, User, Report, Subscription, Transaction, Plan } from '@app/common/entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres', host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres', password: process.env.DB_PASSWORD || 'Aarinola',
      database: process.env.DB_NAME || 'connecta_db', autoLoadEntities: true, synchronize: true,
    }),
    TypeOrmModule.forFeature([AdminUser, AdminSession, AuditLog, SystemSetting, User, Report, Subscription, Transaction, Plan]),
    JwtModule.register({ secret: process.env.JWT_SECRET || 'connecta_admin_secret', signOptions: { expiresIn: '15m' } }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AppModule {}

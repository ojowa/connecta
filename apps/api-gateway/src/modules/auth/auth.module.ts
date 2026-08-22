import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthEventsHandler } from './auth-events.handler';
import { User, Session, OtpCode, BiometricCredential, Profile, Notification, Subscription } from '@app/common/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session, OtpCode, BiometricCredential, Profile, Notification, Subscription]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'connecta-dev-jwt-secret-2026',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthEventsHandler],
  exports: [AuthService],
})
export class AuthModule {}

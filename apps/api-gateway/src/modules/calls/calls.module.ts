import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';
import { CallsGateway } from './calls.gateway';
import { CallSession, User, Profile, Notification } from '@app/common/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([CallSession, User, Profile, Notification]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'connecta-dev-jwt-secret-2026',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [CallsController],
  providers: [CallsService, CallsGateway],
  exports: [CallsService],
})
export class CallsModule {}

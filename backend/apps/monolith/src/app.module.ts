import { Module } from '@nestjs/common';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '@app/database/typeorm-config.service';
import { LoggerLibModule } from '@app/logger';
import { RequestLoggingInterceptor } from './gateway/interceptors/request-logging.interceptor';
import { TimeoutInterceptor } from './gateway/interceptors/timeout.interceptor';
import { ResponseTransformInterceptor } from './gateway/interceptors/response-transform.interceptor';
import { AuditLogInterceptor } from './gateway/interceptors/audit-log.interceptor';
import { EntitiesModule } from './entities.module';
import { MonolithHealthModule } from './health/health.module';
import {
  AdminFeatureModule,
  AuthFeatureModule,
  CallsFeatureModule,
  ChatFeatureModule,
  ContentFeatureModule,
  MatchingFeatureModule,
  MediaFeatureModule,
  NotificationsFeatureModule,
  PaymentsFeatureModule,
  SearchFeatureModule,
  SupportFeatureModule,
  UsersFeatureModule,
} from './features';

/**
 * Single-process monolith: every microservice's controllers/providers run
 * inside one Nest application sharing a single PostgreSQL connection, so no
 * child processes are spawned and no internal ports (3001-3012) are bound.
 * This is what makes it deployable as a single Passenger/cPanel Node app.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 120 }]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || '',
      signOptions: { expiresIn: '15m' },
    }),

    // The one and only database connection for the whole process.
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    EntitiesModule,

    LoggerLibModule,
    MonolithHealthModule,

    RouterModule.register([
      { path: 'auth', module: AuthFeatureModule },
      { path: 'users', module: UsersFeatureModule },
      { path: 'matching', module: MatchingFeatureModule },
      { path: 'chat', module: ChatFeatureModule },
      { path: 'calls', module: CallsFeatureModule },
      { path: 'media', module: MediaFeatureModule },
      { path: 'payments', module: PaymentsFeatureModule },
      { path: 'notifications', module: NotificationsFeatureModule },
      { path: 'search', module: SearchFeatureModule },
      { path: 'content', module: ContentFeatureModule },
      { path: 'support', module: SupportFeatureModule },
      { path: 'admin', module: AdminFeatureModule },
    ]),

    AuthFeatureModule,
    UsersFeatureModule,
    MatchingFeatureModule,
    ChatFeatureModule,
    CallsFeatureModule,
    MediaFeatureModule,
    PaymentsFeatureModule,
    NotificationsFeatureModule,
    SearchFeatureModule,
    ContentFeatureModule,
    SupportFeatureModule,
    AdminFeatureModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    RequestLoggingInterceptor,
    TimeoutInterceptor,
    ResponseTransformInterceptor,
    AuditLogInterceptor,
  ],
})
export class MonolithModule {}

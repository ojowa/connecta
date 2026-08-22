import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerLibModule } from '@app/logger';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { MatchingModule } from './modules/matching/matching.module';
import { ChatModule } from './modules/chat/chat.module';
import { CallsModule } from './modules/calls/calls.module';
import { MediaModule } from './modules/media/media.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';
import { AdminModule } from './modules/admin/admin.module';
import { CryptoModule } from './modules/crypto/crypto.module';
import { SyncModule } from './modules/sync/sync.module';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { DeviceInfoMiddleware } from './middleware/device-info.middleware';
import { RequestLoggingInterceptor } from './interceptors/request-logging.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import {
  User, Session, OtpCode, Profile, Photo, Interest, ProfileInterest,
  UserPreference, Like, Pass, Match, DailyLike, Conversation,
  ConversationParticipant, Message, MessageReaction, ReadReceipt,
  Block, Report, Plan, Subscription, Transaction, Notification,
  NotificationPreference, CallSession, AdminUser, AdminSession,
  AuditLog, SystemSetting, Media, PreKeyBundle, BiometricCredential,
  DeviceToken,
} from '@app/common/entities';

const entities = [
  User, Session, OtpCode, Profile, Photo, Interest, ProfileInterest,
  UserPreference, Like, Pass, Match, DailyLike, Conversation,
  ConversationParticipant, Message, MessageReaction, ReadReceipt,
  Block, Report, Plan, Subscription, Transaction, Notification,
  NotificationPreference, CallSession, AdminUser, AdminSession,
  AuditLog, SystemSetting, Media, PreKeyBundle, BiometricCredential,
  DeviceToken,
];

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
      logging: process.env.DB_LOGGING === 'true',
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 120 }]),
    LoggerLibModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    MatchingModule,
    ChatModule,
    CallsModule,
    MediaModule,
    PaymentsModule,
    NotificationsModule,
    SearchModule,
    AdminModule,
    CryptoModule,
    SyncModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    RequestLoggingInterceptor,
    TimeoutInterceptor,
    ResponseTransformInterceptor,
    AuditLogInterceptor,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, DeviceInfoMiddleware).forRoutes('*');
  }
}

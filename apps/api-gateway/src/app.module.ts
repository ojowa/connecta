import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
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
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { DeviceInfoMiddleware } from './middleware/device-info.middleware';
import { RequestLoggingInterceptor } from './interceptors/request-logging.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 120 },
    ]),
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
  ],
  providers: [
    RequestLoggingInterceptor,
    TimeoutInterceptor,
    ResponseTransformInterceptor,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, DeviceInfoMiddleware).forRoutes('*');
  }
}

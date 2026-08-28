import 'tsconfig-paths/register';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GatewayExceptionFilter } from './filters/gateway-exception.filter';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { DeviceInfoMiddleware } from './middleware/device-info.middleware';
import { AuthMiddleware } from './middleware/auth.middleware';
import { RequestLoggingInterceptor } from './interceptors/request-logging.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  app.setGlobalPrefix('v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new GatewayExceptionFilter());
  app.useGlobalInterceptors(
    app.get(RequestLoggingInterceptor),
    app.get(TimeoutInterceptor),
    app.get(ResponseTransformInterceptor),
    app.get(AuditLogInterceptor),
  );

  const requestId = new RequestIdMiddleware();
  app.use(requestId.use.bind(requestId));
  const deviceInfo = new DeviceInfoMiddleware();
  app.use(deviceInfo.use.bind(deviceInfo));
  const authMiddleware = new AuthMiddleware();
  app.use(authMiddleware.use.bind(authMiddleware));

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-Id',
      'X-Platform',
      'X-App-Version',
      'X-Device-Id',
      'X-Timeout',
    ],
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('OJChat API Gateway')
    .setDescription('OJChat Dating Platform — API Gateway (Microservices)')
    .setVersion('2.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints → auth-service:3001')
    .addTag('users', 'User management → users-service:3002')
    .addTag('matching', 'Matching and discovery → matching-service:3003')
    .addTag('chat', 'Messaging and conversations → chat-service:3004')
    .addTag('calls', 'Voice and video calls → calls-service:3005')
    .addTag('media', 'Media upload → media-service:3006')
    .addTag('payments', 'Payments and subscriptions → payments-service:3007')
    .addTag('notifications', 'Push notifications → notifications-service:3008')
    .addTag('search', 'Search and discovery → search-service:3009')
    .addTag('content', 'Static content → content-service:3010')
    .addTag('support', 'Support tickets → support-service:3011')
    .addTag('admin', 'Admin panel → admin-service:3012')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  new Logger('ApiGateway').log(`API Gateway running on port ${port} (0.0.0.0)`);
  new Logger('ApiGateway').log(
    `Microservices: auth:3001, users:3002, matching:3003, chat:3004, calls:3005, media:3006, payments:3007, notifications:3008, search:3009, content:3010, support:3011, admin:3012`,
  );
}
bootstrap();

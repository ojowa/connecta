import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GatewayExceptionFilter } from './filters/gateway-exception.filter';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { DeviceInfoMiddleware } from './middleware/device-info.middleware';
import { RequestLoggingInterceptor } from './interceptors/request-logging.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';

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
  );

  app.use(RequestIdMiddleware);
  app.use(DeviceInfoMiddleware);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Platform', 'X-App-Version', 'X-Device-Id', 'X-Timeout'],
  });

  const config = new DocumentBuilder()
    .setTitle('Connecta API Gateway')
    .setDescription('Connecta Dating Platform — API Gateway')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('profiles', 'Profile management')
    .addTag('matching', 'Matching and discovery')
    .addTag('chat', 'Messaging and conversations')
    .addTag('calls', 'Voice and video calls')
    .addTag('media', 'Media upload and management')
    .addTag('payments', 'Payments and subscriptions')
    .addTag('notifications', 'Push notifications')
    .addTag('search', 'Search and discovery')
    .addTag('admin', 'Admin panel')
    .addTag('crypto', 'End-to-end encryption key management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API Gateway running on port ${port}`);
}
bootstrap();

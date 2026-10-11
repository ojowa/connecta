import 'tsconfig-paths/register';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import { MonolithModule } from './app.module';
import { GatewayExceptionFilter } from './gateway/filters/gateway-exception.filter';
import { RequestIdMiddleware } from './gateway/middleware/request-id.middleware';
import { DeviceInfoMiddleware } from './gateway/middleware/device-info.middleware';
import { AuthMiddleware } from './gateway/middleware/auth.middleware';
import { RequestLoggingInterceptor } from './gateway/interceptors/request-logging.interceptor';
import { TimeoutInterceptor } from './gateway/interceptors/timeout.interceptor';
import { ResponseTransformInterceptor } from './gateway/interceptors/response-transform.interceptor';
import { AuditLogInterceptor } from './gateway/interceptors/audit-log.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(MonolithModule, {
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

  // In the microservice layout the gateway proxy copied the verified user id
  // onto an x-user-id header before forwarding. Here everything is in-process,
  // so do the same bridge so controllers keep reading @Headers('x-user-id').
  app.use((req: any, _res: unknown, next: () => void) => {
    if (req.userId) {
      req.headers['x-user-id'] = req.userId;
    }
    next();
  });

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

  // WebSocket support (calls-service signalling).
  app.useWebSocketAdapter(new IoAdapter(app));

  // media-service served uploads at /media/files; keep that path under /v1.
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/v1/media/files' });

  const config = new DocumentBuilder()
    .setTitle('OJChat API')
    .setDescription('OJChat Dating Platform - single-process monolith (all services in one app)')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  new Logger('Monolith').log(`OJChat monolith running on port ${port}`);
}

bootstrap();

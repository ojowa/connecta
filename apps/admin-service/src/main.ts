import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });
  app.use(helmet({
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
  }));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: { url: process.env.NATS_URL || 'nats://localhost:4222' },
  });

  const port = process.env.PORT || 3011;
  await app.startAllMicroservices();
  await app.listen(port);
  new Logger('AdminService').log(`Admin Service running on port ${port} + NATS`);
}
bootstrap();

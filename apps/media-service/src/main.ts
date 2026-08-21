import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: { url: process.env.NATS_URL || 'nats://localhost:4222' },
  });

  const port = process.env.PORT || 3007;
  await app.startAllMicroservices();
  await app.listen(port);
  new Logger('MediaService').log(`Media Service running on port ${port} + NATS`);
}
bootstrap();

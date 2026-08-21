import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: { url: process.env.NATS_URL || 'nats://localhost:4222' },
  });

  const port = process.env.PORT || 3005;
  await app.startAllMicroservices();
  await app.listen(port);
  new Logger('ChatService').log(`Chat Service running on port ${port} + NATS`);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: { url: process.env.NATS_URL || 'nats://localhost:4222' },
  });

  const port = process.env.PORT || 3001;
  await app.startAllMicroservices();
  await app.listen(port);
  new Logger('AuthService').log(`Auth Service running on port ${port} + NATS`);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });
  const port = process.env.PORT || 3007;
  await app.listen(port);
  new Logger('MediaService').log(`Media Service running on port ${port}`);
}
bootstrap();

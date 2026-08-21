import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });
  const port = process.env.PORT || 3003;
  await app.listen(port);
  new Logger('ProfileService').log(`Profile Service running on port ${port}`);
}
bootstrap();

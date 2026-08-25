import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('support');
  app.enableCors();
  await app.listen(3011);
  console.log('Support Service running on port 3011');
}
bootstrap();

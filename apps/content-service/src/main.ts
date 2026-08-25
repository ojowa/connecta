import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('content');
  app.enableCors();
  await app.listen(3010);
  console.log('Content Service running on port 3010');
}
bootstrap();

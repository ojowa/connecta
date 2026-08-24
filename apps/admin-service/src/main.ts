import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('admin');
  app.enableCors();
  await app.listen(3012);
  console.log('Admin Service running on port 3012');
}
bootstrap();

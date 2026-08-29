import 'tsconfig-paths/register';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { MatchingService } from './matching.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('matching');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(3003);
  console.log('Matching Service running on port 3003');

  const matchingService = app.get(MatchingService);
  setInterval(async () => {
    try {
      const result = await matchingService.cleanupExpiredMoments();
      if (result.deleted > 0) console.log(`Cleaned up ${result.deleted} expired moments`);
    } catch (e) {
      console.error('Moment cleanup failed:', e);
    }
  }, 60 * 60 * 1000);
}
bootstrap();

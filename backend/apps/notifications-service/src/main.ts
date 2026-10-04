import 'tsconfig-paths/register';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NotificationsService } from './notifications.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('notifications');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(3008);
  console.log('Notifications Service running on port 3008');

  const notifService = app.get(NotificationsService);
  setInterval(async () => {
    try {
      await notifService.cleanupOldNotifications();
    } catch (e) {
      console.error('Notification cleanup failed:', e);
    }
  }, 24 * 60 * 60 * 1000);
}
bootstrap();

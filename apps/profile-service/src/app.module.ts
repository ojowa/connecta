import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { ProfileEventsHandler } from './events/profile-events.handler';
import { Profile, Photo, Interest, ProfileInterest, User, Notification } from '@app/common/entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres', host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres', password: process.env.DB_PASSWORD || 'Aarinola',
      database: process.env.DB_NAME || 'connecta_db', autoLoadEntities: true, synchronize: true,
    }),
    TypeOrmModule.forFeature([Profile, Photo, Interest, ProfileInterest, User, Notification]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService, ProfileEventsHandler],
})
export class AppModule {}

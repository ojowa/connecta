import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { ProfileEventsHandler } from './profile-events.handler';
import { Profile, Photo, Interest, ProfileInterest, User, Notification } from '@app/common/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, Photo, Interest, ProfileInterest, User, Notification]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService, ProfileEventsHandler],
  exports: [ProfilesService],
})
export class ProfilesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEventsHandler } from './user-events.handler';
import { User, Profile, UserPreference, Block, Report, Photo, Notification, PreKeyBundle, Message } from '@app/common/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, UserPreference, Block, Report, Photo, Notification, PreKeyBundle, Message]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserEventsHandler],
  exports: [UsersService],
})
export class UsersModule {}

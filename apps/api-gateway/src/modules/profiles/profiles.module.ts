import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProfilesController } from './profiles.controller';

@Module({
  imports: [HttpModule],
  controllers: [ProfilesController],
})
export class ProfilesModule {}

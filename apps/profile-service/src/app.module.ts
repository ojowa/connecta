import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class AppModule {}

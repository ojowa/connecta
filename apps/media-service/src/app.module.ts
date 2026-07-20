import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [MediaController],
  providers: [MediaService],
})
export class AppModule {}

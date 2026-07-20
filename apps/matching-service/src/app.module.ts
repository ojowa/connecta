import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [MatchingController],
  providers: [MatchingService],
})
export class AppModule {}

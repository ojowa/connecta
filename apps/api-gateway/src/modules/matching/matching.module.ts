import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MatchingController } from './matching.controller';

@Module({
  imports: [HttpModule],
  controllers: [MatchingController],
})
export class MatchingModule {}

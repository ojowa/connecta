import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CallsController } from './calls.controller';

@Module({
  imports: [HttpModule],
  controllers: [CallsController],
})
export class CallsModule {}

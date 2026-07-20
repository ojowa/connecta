import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CryptoController } from './crypto.controller';

@Module({
  imports: [HttpModule],
  controllers: [CryptoController],
})
export class CryptoModule {}

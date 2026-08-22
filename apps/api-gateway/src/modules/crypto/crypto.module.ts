import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoController } from './crypto.controller';
import { UsersModule } from '../users/users.module';
import { PreKeyBundle, User } from '@app/common/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([PreKeyBundle, User]),
    UsersModule,
  ],
  controllers: [CryptoController],
})
export class CryptoModule {}

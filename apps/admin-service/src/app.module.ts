import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TerminusModule, TypeOrmHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { TypeOrmConfigService } from '@app/database/typeorm-config.service';

@Module({
  imports: [
    TerminusModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
  ],
  controllers: [HealthController],
  providers: [TypeOrmHealthIndicator, MemoryHealthIndicator],
})
export class HealthModule {}

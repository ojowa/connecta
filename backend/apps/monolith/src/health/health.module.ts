import { Module } from '@nestjs/common';
import { TerminusModule, TypeOrmHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';

/**
 * Health endpoints for the monolith. Unlike the gateway's HealthModule this one
 * does NOT register its own TypeOrmModule.forRootAsync - the root module owns
 * the single connection.
 */
@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [TypeOrmHealthIndicator, MemoryHealthIndicator],
})
export class MonolithHealthModule {}

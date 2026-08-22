import { Module } from '@nestjs/common';
import { TerminusModule, TypeOrmHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TerminusModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'Aarinola',
      database: process.env.DB_NAME || 'connecta_db',
      autoLoadEntities: true,
      synchronize: false,
    }),
  ],
  controllers: [HealthController],
  providers: [TypeOrmHealthIndicator, MemoryHealthIndicator],
})
export class HealthModule {}

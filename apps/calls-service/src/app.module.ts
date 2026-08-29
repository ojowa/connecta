import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { allEntities } from '@app/common/entities';
import { TypeOrmConfigService } from '@app/database/typeorm-config.service';
import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';
import { CallsGateway } from './calls.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature(allEntities),
    EventEmitterModule.forRoot(),
  ],
  controllers: [CallsController],
  providers: [CallsService, CallsGateway],
  exports: [CallsGateway],
})
export class AppModule {}

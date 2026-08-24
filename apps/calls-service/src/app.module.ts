import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CallSession, User, Profile, Notification } from '@app/common/entities';
import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';

const entities = [CallSession, User, Profile, Notification];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'connecta_user',
      password: process.env.DB_PASSWORD || 'connecta_password',
      database: process.env.DB_NAME || 'connecta_db',
      entities,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature(entities),
    EventEmitterModule.forRoot(),
  ],
  controllers: [CallsController],
  providers: [CallsService],
})
export class AppModule {}

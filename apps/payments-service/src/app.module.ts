import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { allEntities } from '@app/common/entities';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'ojchat_user',
      password: process.env.DB_PASSWORD || 'ojchat_password',
      database: process.env.DB_NAME || 'ojchat_db',
      entities: allEntities,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature(allEntities),
    EventEmitterModule.forRoot(),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class AppModule {}

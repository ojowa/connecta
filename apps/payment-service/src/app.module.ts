import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NatsModule } from '@app/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentEventsHandler } from './events/payment-events.handler';
import { Plan, Subscription, Transaction, User, Notification } from '@app/common/entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NatsModule,
    TypeOrmModule.forRoot({
      type: 'postgres', host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres', password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'connecta_db', autoLoadEntities: true, synchronize: false,
    }),
    TypeOrmModule.forFeature([Plan, Subscription, Transaction, User, Notification]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentEventsHandler],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentEventsHandler } from './payment-events.handler';
import { Plan, Subscription, Transaction, User, Notification } from '@app/common/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, Subscription, Transaction, User, Notification])],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentEventsHandler],
  exports: [PaymentsService],
})
export class PaymentsModule {}

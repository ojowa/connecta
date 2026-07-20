import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsController, PaymentTransactionsController } from './payments.controller';

@Module({
  imports: [HttpModule],
  controllers: [PaymentsController, PaymentTransactionsController],
})
export class PaymentsModule {}

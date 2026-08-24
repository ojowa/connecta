import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get subscription plans' })
  getPlans(@Query('country') country?: string, @Query('currency') currency?: string) {
    return this.paymentsService.getPlans(country, currency);
  }

  @Post('subscribe')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe to plan' })
  subscribe(@Body('_userId') userId: string, @Body() body: any) {
    return this.paymentsService.subscribe(userId, body);
  }

  @Post('subscribe/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel subscription' })
  cancel(@Body('_userId') userId: string, @Body() body: any) {
    return this.paymentsService.cancelSubscription(userId, body);
  }

  @Put('subscribe/upgrade')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upgrade plan' })
  upgrade(@Body('_userId') userId: string, @Body() body: any) {
    return this.paymentsService.upgradePlan(userId, body);
  }

  @Post('initialize')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize payment' })
  initialize(@Body('_userId') userId: string, @Body() body: any) {
    return this.paymentsService.initializePayment(userId, body);
  }

  @Post('verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify payment' })
  verify(@Body('_userId') userId: string, @Body() body: any) {
    return this.paymentsService.verifyPayment(userId, body.reference);
  }

  @Get('history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Payment history' })
  history(@Body('_userId') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.paymentsService.getPaymentHistory(userId, page, limit);
  }

  @Get('wallet')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get wallet balance and transactions' })
  wallet(@Body('_userId') userId: string) {
    return this.paymentsService.getWallet(userId);
  }

  @Get('transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transaction history' })
  transactions(@Body('_userId') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.paymentsService.getTransactions(userId, page, limit);
  }

  @Get('options')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available payment options' })
  options(@Body('_userId') userId: string) {
    return this.paymentsService.getPaymentOptions(userId);
  }

  @Post('refund/:transactionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request refund' })
  refund(@Body('_userId') userId: string, @Param('transactionId') txnId: string, @Body() body: any) {
    return this.paymentsService.requestRefund(userId, txnId, body);
  }

  @Post('webhook/paystack')
  @ApiOperation({ summary: 'Paystack webhook' })
  webhook(@Body() payload: any, @Query('signature') signature?: string) {
    return this.paymentsService.handleWebhook(payload, signature || '');
  }
}

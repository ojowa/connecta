import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { SubscribeDto, CancelSubscriptionDto, UpgradePlanDto, InitializePaymentDto, VerifyPaymentDto, RequestRefundDto } from './dto';

@ApiTags('Payments') @Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('plans') @ApiOperation({ summary: 'Get subscription plans' })
  getPlans(@Query('country') country?: string, @Query('currency') currency?: string) { return this.paymentsService.getPlans(country, currency); }

  @Post('subscribe') @ApiOperation({ summary: 'Subscribe to plan' }) @ApiBearerAuth()
  subscribe(@Body('_userId') userId: string, @Body() body: SubscribeDto) { return this.paymentsService.subscribe(userId, body); }

  @Post('subscribe/cancel') @ApiOperation({ summary: 'Cancel subscription' }) @ApiBearerAuth()
  cancel(@Body('_userId') userId: string, @Body() body: CancelSubscriptionDto) { return this.paymentsService.cancelSubscription(userId, body); }

  @Put('subscribe/upgrade') @ApiOperation({ summary: 'Upgrade plan' }) @ApiBearerAuth()
  upgrade(@Body('_userId') userId: string, @Body() body: UpgradePlanDto) { return this.paymentsService.upgradePlan(userId, body); }

  @Post('initialize') @ApiOperation({ summary: 'Initialize payment' }) @ApiBearerAuth()
  initialize(@Body('_userId') userId: string, @Body() body: InitializePaymentDto) { return this.paymentsService.initializePayment(userId, body); }

  @Post('verify') @ApiOperation({ summary: 'Verify payment' }) @ApiBearerAuth()
  verify(@Body('_userId') userId: string, @Body() body: VerifyPaymentDto) { return this.paymentsService.verifyPayment(userId, body.reference); }

  @Get('history') @ApiOperation({ summary: 'Payment history' }) @ApiBearerAuth()
  history(@Body('_userId') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) { return this.paymentsService.getPaymentHistory(userId, page, limit); }

  @Post('refund/:transactionId') @ApiOperation({ summary: 'Request refund' }) @ApiBearerAuth()
  refund(@Body('_userId') userId: string, @Param('transactionId') txnId: string, @Body() body: RequestRefundDto) { return this.paymentsService.requestRefund(userId, txnId, body); }
}

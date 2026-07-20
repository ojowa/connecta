import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get plans' })
  getPlans() {
    return this.paymentsService.getPlans();
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe' })
  subscribe(@Body() body: any) {
    return this.paymentsService.subscribe(body);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  cancel(@Body() body: any) {
    return this.paymentsService.cancel(body);
  }

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize payment' })
  initialize(@Body() body: any) {
    return this.paymentsService.initialize(body);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment' })
  verify(@Body() body: any) {
    return this.paymentsService.verify(body);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get payment history' })
  getHistory() {
    return this.paymentsService.getHistory();
  }
}

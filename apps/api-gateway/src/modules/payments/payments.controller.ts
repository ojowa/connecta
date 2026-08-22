import { Controller, Get, Post, Put, Body, Param, Query, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { proxyGet, proxyPost, proxyPut } from '../../helpers/proxy.helper';

const PAYMENT_SERVICE = process.env.PAYMENT_SERVICE_URL;

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly http: HttpService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans' })
  async getPlans(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${PAYMENT_SERVICE}/payments/plans`, req, res);
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to a plan' })
  async subscribe(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${PAYMENT_SERVICE}/payments/subscribe`, body, req, res);
  }

  @Post('subscribe/cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  async cancelSubscription(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${PAYMENT_SERVICE}/payments/subscribe/cancel`, body, req, res);
  }

  @Put('subscribe/upgrade')
  @ApiOperation({ summary: 'Upgrade or downgrade subscription' })
  async upgradeSubscription(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPut(this.http, `${PAYMENT_SERVICE}/payments/subscribe/upgrade`, body, req, res);
  }

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize a one-time payment' })
  async initializePayment(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${PAYMENT_SERVICE}/payments/initialize`, body, req, res);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify a payment transaction' })
  async verifyPayment(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${PAYMENT_SERVICE}/payments/verify`, body, req, res);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get payment history' })
  async getPaymentHistory(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${PAYMENT_SERVICE}/payments/history`, req, res);
  }

  @Post('refund/:transactionId')
  @ApiOperation({ summary: 'Request a refund' })
  async requestRefund(
    @Param('transactionId') transactionId: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return proxyPost(
      this.http,
      `${PAYMENT_SERVICE}/payments/refund/${transactionId}`,
      body,
      req,
      res,
    );
  }
}

import { Controller, Get, Post, Body, Param, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const PAYMENT_SERVICE = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3008';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('subscriptions')
export class PaymentsController {
  constructor(private readonly http: HttpService) {}

  private authHeaders(req: Request) {
    return { authorization: req.headers.authorization };
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans' })
  async getPlans(@Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${PAYMENT_SERVICE}/subscriptions/plans`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to a plan' })
  async subscribe(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${PAYMENT_SERVICE}/subscriptions/subscribe`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  async cancelSubscription(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${PAYMENT_SERVICE}/subscriptions/cancel`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade subscription' })
  async upgradeSubscription(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${PAYMENT_SERVICE}/subscriptions/upgrade`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }
}

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentTransactionsController {
  constructor(private readonly http: HttpService) {}

  private authHeaders(req: Request) {
    return { authorization: req.headers.authorization };
  }

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize a payment' })
  async initializePayment(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${PAYMENT_SERVICE}/payments/initialize`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify a payment' })
  async verifyPayment(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${PAYMENT_SERVICE}/payments/verify`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get payment history' })
  async getPaymentHistory(@Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${PAYMENT_SERVICE}/payments/history`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('refund')
  @ApiOperation({ summary: 'Request a refund' })
  async requestRefund(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${PAYMENT_SERVICE}/payments/refund`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }
}

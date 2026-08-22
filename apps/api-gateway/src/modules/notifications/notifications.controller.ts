import { Controller, Get, Put, Post, Body, Query, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { proxyGet, proxyPost, proxyPut, handleError } from '../../helpers/proxy.helper';
import { firstValueFrom } from 'rxjs';

const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE_URL;

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly http: HttpService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications' })
  async getNotifications(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${NOTIFICATION_SERVICE}/notifications`, req, res);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  async getPreferences(@Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${NOTIFICATION_SERVICE}/notifications/preferences`, req, res);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  async updatePreferences(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPut(this.http, `${NOTIFICATION_SERVICE}/notifications/preferences`, body, req, res);
  }

  @Put('read')
  @ApiOperation({ summary: 'Mark notifications as read' })
  async markRead(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPut(this.http, `${NOTIFICATION_SERVICE}/notifications/read`, body, req, res);
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Send broadcast notification (admin)' })
  async broadcast(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${NOTIFICATION_SERVICE}/notifications/broadcast`, body, req, res);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register push notification token' })
  async registerToken(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${NOTIFICATION_SERVICE}/notifications/register`, body, req, res);
  }
}

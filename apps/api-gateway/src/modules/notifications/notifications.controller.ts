import { Controller, Get, Put, Post, Body, Query, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3009';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly http: HttpService) {}

  private authHeaders(req: Request) {
    return { authorization: req.headers.authorization };
  }

  @Get()
  @ApiOperation({ summary: 'Get notifications' })
  async getNotifications(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${NOTIFICATION_SERVICE}/notifications`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  async updatePreferences(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.put(`${NOTIFICATION_SERVICE}/notifications/preferences`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('mark-read')
  @ApiOperation({ summary: 'Mark notifications as read' })
  async markRead(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${NOTIFICATION_SERVICE}/notifications/mark-read`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Put('quiet-hours')
  @ApiOperation({ summary: 'Set quiet hours' })
  async setQuietHours(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.put(`${NOTIFICATION_SERVICE}/notifications/quiet-hours`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }
}

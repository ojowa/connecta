import { Controller, Get, Put, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications' })
  getNotifications(@Query() query: any) {
    return this.notificationsService.getNotifications(query);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update preferences' })
  updatePreferences(@Body() body: any) {
    return this.notificationsService.updatePreferences(body);
  }

  @Post('mark-read')
  @ApiOperation({ summary: 'Mark as read' })
  markRead(@Body() body: any) {
    return this.notificationsService.markRead(body);
  }

  @Post('send')
  @ApiOperation({ summary: 'Send notification' })
  send(@Body() body: any) {
    return this.notificationsService.send(body);
  }
}

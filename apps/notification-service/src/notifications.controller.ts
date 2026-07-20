import { Controller, Get, Put, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications') @ApiBearerAuth() @Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get() @ApiOperation({ summary: 'List notifications' })
  list(@Body('_userId') userId: string, @Query('page') page?: number, @Query('limit') limit?: number, @Query('filter') filter?: string) {
    return this.notificationsService.getNotifications(userId, page, limit, filter);
  }

  @Get('preferences') @ApiOperation({ summary: 'Get preferences' })
  getPrefs(@Body('_userId') userId: string) { return this.notificationsService.getPreferences(userId); }

  @Put('preferences') @ApiOperation({ summary: 'Update preferences' })
  updatePrefs(@Body('_userId') userId: string, @Body() body: any) { return this.notificationsService.updatePreferences(userId, body); }

  @Put('read') @ApiOperation({ summary: 'Mark as read' })
  markRead(@Body('_userId') userId: string, @Body() body: any) { return this.notificationsService.markAsRead(userId, body); }

  @Post('broadcast') @ApiOperation({ summary: 'Send broadcast notification (admin)' })
  broadcast(@Body() body: any) { return this.notificationsService.broadcast(body); }
}

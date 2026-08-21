import { Controller, Get, Put, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationListQueryDto, UpdateNotificationPrefsDto, MarkNotificationsReadDto, BroadcastNotificationDto } from './dto';

@ApiTags('Notifications') @ApiBearerAuth() @Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get() @ApiOperation({ summary: 'List notifications' })
  list(@Body('_userId') userId: string, @Query() query: NotificationListQueryDto) {
    return this.notificationsService.getNotifications(userId, query.page, query.limit, query.filter);
  }

  @Get('preferences') @ApiOperation({ summary: 'Get preferences' })
  getPrefs(@Body('_userId') userId: string) { return this.notificationsService.getPreferences(userId); }

  @Put('preferences') @ApiOperation({ summary: 'Update preferences' })
  updatePrefs(@Body('_userId') userId: string, @Body() body: UpdateNotificationPrefsDto) { return this.notificationsService.updatePreferences(userId, body); }

  @Put('read') @ApiOperation({ summary: 'Mark as read' })
  markRead(@Body('_userId') userId: string, @Body() body: MarkNotificationsReadDto) { return this.notificationsService.markAsRead(userId, body); }

  @Post('broadcast') @ApiOperation({ summary: 'Send broadcast notification (admin)' })
  broadcast(@Body() body: BroadcastNotificationDto) { return this.notificationsService.broadcast(body); }

  @Post('register') @ApiOperation({ summary: 'Register push notification token' })
  registerToken(@Body('_userId') userId: string, @Body() body: { token: string; platform: string; deviceId?: string }) {
    return this.notificationsService.registerDeviceToken(userId, body);
  }
}

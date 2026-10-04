import { Controller, Get, Post, Put, Body, Query, Headers, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications' })
  getNotifications(@Headers('x-user-id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.notificationsService.getNotifications(userId, page, limit);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  getPreferences(@Headers('x-user-id') userId: string) {
    return this.notificationsService.getPreferences(userId);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  updatePreferences(@Headers('x-user-id') userId: string, @Body() body: any) {
    return this.notificationsService.updatePreferences(userId, body);
  }

  @Put('read')
  @ApiOperation({ summary: 'Mark notifications as read' })
  markAsRead(@Headers('x-user-id') userId: string, @Body() body: any) {
    return this.notificationsService.markAsRead(userId, body);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register device token' })
  registerDevice(@Headers('x-user-id') userId: string, @Body() body: any) {
    return this.notificationsService.registerDevice(userId, body);
  }

  @Post('track')
  @ApiOperation({ summary: 'Track notification delivery' })
  trackDelivery(@Body() body: any) {
    return this.notificationsService.trackDelivery(body);
  }

  @Put('track/:id/delivered')
  @ApiOperation({ summary: 'Mark notification as delivered' })
  markDelivered(@Param('id') id: string) {
    return this.notificationsService.markDelivered(id);
  }

  @Put('track/:id/opened')
  @ApiOperation({ summary: 'Mark notification as opened' })
  markOpened(@Param('id') id: string) {
    return this.notificationsService.markOpened(id);
  }

  @Put('track/:id/clicked')
  @ApiOperation({ summary: 'Mark notification as clicked' })
  markClicked(@Param('id') id: string) {
    return this.notificationsService.markClicked(id);
  }

  @Put('track/:id/failed')
  @ApiOperation({ summary: 'Mark notification as failed' })
  markFailed(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.notificationsService.markFailed(id, body.reason);
  }
}

import { Controller, Get, Post, Put, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications' })
  getNotifications(@Body('_userId') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.notificationsService.getNotifications(userId, page, limit);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  getPreferences(@Body('_userId') userId: string) {
    return this.notificationsService.getPreferences(userId);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  updatePreferences(@Body('_userId') userId: string, @Body() body: any) {
    return this.notificationsService.updatePreferences(userId, body);
  }

  @Put('read')
  @ApiOperation({ summary: 'Mark notifications as read' })
  markAsRead(@Body('_userId') userId: string, @Body() body: any) {
    return this.notificationsService.markAsRead(userId, body);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register device token' })
  registerDevice(@Body('_userId') userId: string, @Body() body: any) {
    return this.notificationsService.registerDevice(userId, body);
  }
}

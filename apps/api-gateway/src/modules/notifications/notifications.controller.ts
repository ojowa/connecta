import { Controller, Get, Put, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  @Get()
  @ApiOperation({ summary: 'Get notifications' })
  getNotifications(@Query() query: any) {
    return { message: 'Get notifications endpoint — to be implemented' };
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  updatePreferences(@Body() body: any) {
    return { message: 'Update preferences endpoint — to be implemented' };
  }

  @Post('mark-read')
  @ApiOperation({ summary: 'Mark notifications as read' })
  markRead(@Body() body: any) {
    return { message: 'Mark read endpoint — to be implemented' };
  }

  @Put('quiet-hours')
  @ApiOperation({ summary: 'Set quiet hours' })
  setQuietHours(@Body() body: any) {
    return { message: 'Set quiet hours endpoint — to be implemented' };
  }
}

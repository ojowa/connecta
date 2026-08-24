import { Controller, Get, Patch, Put, Post, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  getMe(@Headers('x-user-id') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user' })
  updateMe(@Headers('x-user-id') userId: string, @Body() body: any) {
    return this.usersService.updateMe(userId, body);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete account' })
  deleteMe(@Headers('x-user-id') userId: string, @Body() body: any) {
    return this.usersService.deleteAccount(userId, body.password);
  }

  @Get('me/preferences')
  @ApiOperation({ summary: 'Get preferences' })
  getPreferences(@Headers('x-user-id') userId: string) {
    return this.usersService.getPreferences(userId);
  }

  @Put('me/preferences')
  @ApiOperation({ summary: 'Update preferences' })
  updatePreferences(@Headers('x-user-id') userId: string, @Body() body: any) {
    return this.usersService.updatePreferences(userId, body);
  }

  @Get('me/blocks')
  @ApiOperation({ summary: 'List blocked users' })
  getBlockedUsers(@Headers('x-user-id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.usersService.getBlockedUsers(userId, page, limit);
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Get user profile with photos' })
  getProfile(@Headers('x-user-id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Post('me/export-data')
  @ApiOperation({ summary: 'Export user data' })
  exportData(@Headers('x-user-id') userId: string) {
    return this.usersService.exportData(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public profile' })
  getUser(@Param('id') id: string, @Headers('x-user-id') viewerId: string) {
    return this.usersService.getPublicProfile(id, viewerId);
  }

  @Post(':id/block')
  @ApiOperation({ summary: 'Block user' })
  blockUser(@Headers('x-user-id') userId: string, @Param('id') id: string, @Body() body: any) {
    return this.usersService.blockUser(userId, id, body.reason);
  }

  @Delete(':id/block')
  @ApiOperation({ summary: 'Unblock user' })
  unblockUser(@Headers('x-user-id') userId: string, @Param('id') id: string) {
    return this.usersService.unblockUser(userId, id);
  }

  @Post(':id/report')
  @ApiOperation({ summary: 'Report user' })
  reportUser(@Headers('x-user-id') userId: string, @Param('id') id: string, @Body() body: any) {
    return this.usersService.reportUser(userId, id, body);
  }

  @Get('sync')
  @ApiOperation({ summary: 'Get sync delta' })
  getSync(@Headers('x-user-id') userId: string, @Query('since') since?: string) {
    return this.usersService.getSyncDelta(userId, since ? parseInt(since, 10) : 0);
  }
}

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

  @Get('me/photos')
  @ApiOperation({ summary: 'Get profile photos' })
  getPhotos(@Headers('x-user-id') userId: string) {
    return this.usersService.getPhotos(userId);
  }

  @Get('me/prompts')
  @ApiOperation({ summary: 'Get user prompts' })
  getPrompts(@Headers('x-user-id') userId: string) {
    return this.usersService.getPrompts(userId);
  }

  @Put('me/prompts')
  @ApiOperation({ summary: 'Save user prompts' })
  savePrompts(@Headers('x-user-id') userId: string, @Body() body: any) {
    return this.usersService.savePrompts(userId, body.prompts);
  }

  @Get('prompts')
  @ApiOperation({ summary: 'Get available prompts' })
  getAvailablePrompts() {
    return this.usersService.getAvailablePrompts();
  }

  @Post('me/photos')
  @ApiOperation({ summary: 'Add a profile photo' })
  addPhoto(@Headers('x-user-id') userId: string, @Body() body: any) {
    return this.usersService.addPhoto(userId, body);
  }

  @Delete('me/photos/:photoId')
  @ApiOperation({ summary: 'Delete a profile photo' })
  deletePhoto(@Headers('x-user-id') userId: string, @Param('photoId') photoId: string) {
    return this.usersService.deletePhoto(userId, photoId);
  }

  @Put('me/photos/order')
  @ApiOperation({ summary: 'Reorder photos' })
  reorderPhotos(@Headers('x-user-id') userId: string, @Body() body: any) {
    return this.usersService.reorderPhotos(userId, body.orders);
  }

  @Put('me/photos/:photoId/primary')
  @ApiOperation({ summary: 'Set primary photo' })
  setPrimaryPhoto(@Headers('x-user-id') userId: string, @Param('photoId') photoId: string) {
    return this.usersService.setPrimaryPhoto(userId, photoId);
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

  @Post('me/appeal')
  @ApiOperation({ summary: 'Submit an appeal' })
  submitAppeal(@Headers('x-user-id') userId: string, @Body() body: { reason: string; description?: string; evidenceUrls?: string[] }) {
    return this.usersService.submitAppeal(userId, body);
  }

  @Get('me/appeals')
  @ApiOperation({ summary: 'Get my appeals' })
  getMyAppeals(@Headers('x-user-id') userId: string) {
    return this.usersService.getMyAppeals(userId);
  }
}

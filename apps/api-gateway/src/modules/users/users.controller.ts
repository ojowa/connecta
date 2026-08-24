import { Controller, Get, Patch, Put, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  UpdateUserDto,
  DeleteAccountDto,
  UpdatePreferencesDto,
  BlockUserDto,
  ReportUserDto,
} from './dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  getMe(@Body('_userId') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user' })
  updateMe(@Body('_userId') userId: string, @Body() body: UpdateUserDto) {
    return this.usersService.updateMe(userId, body);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete account' })
  deleteMe(@Body('_userId') userId: string, @Body() body: DeleteAccountDto) {
    return this.usersService.deleteAccount(userId, body.password);
  }

  @Get('me/preferences')
  @ApiOperation({ summary: 'Get preferences' })
  getPreferences(@Body('_userId') userId: string) {
    return this.usersService.getPreferences(userId);
  }

  @Put('me/preferences')
  @ApiOperation({ summary: 'Update preferences' })
  updatePreferences(@Body('_userId') userId: string, @Body() body: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(userId, body);
  }

  @Get('me/blocks')
  @ApiOperation({ summary: 'List blocked users' })
  getBlockedUsers(
    @Body('_userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.getBlockedUsers(userId, page, limit);
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Get user profile with photos' })
  getProfile(@Body('_userId') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Post('me/export-data')
  @ApiOperation({ summary: 'Export user data' })
  exportData(@Body('_userId') userId: string) {
    return this.usersService.exportData(userId);
  }

  @Get('me/prekeys')
  @ApiOperation({ summary: 'Get pre-keys' })
  getPreKeys(@Body('_userId') userId: string) {
    return this.usersService.getPreKeys(userId);
  }

  @Post('me/prekeys')
  @ApiOperation({ summary: 'Upload pre-key bundle' })
  uploadPreKeys(@Body('_userId') userId: string, @Body() body: any) {
    return this.usersService.uploadPreKeys(userId, body);
  }

  @Get('me/prekeys/bundle')
  @ApiOperation({ summary: 'Get pre-key bundle' })
  getPreKeyBundle(@Body('_userId') userId: string) {
    return this.usersService.getPreKeyBundle(userId);
  }

  @Get('me/backup')
  @ApiOperation({ summary: 'Get backup' })
  getBackup(@Body('_userId') userId: string) {
    return this.usersService.getBackup(userId);
  }

  @Post('me/backup')
  @ApiOperation({ summary: 'Backup keys' })
  backupKeys(@Body('_userId') userId: string, @Body() body: any) {
    return this.usersService.backupKeys(userId, body);
  }

  @Get('sync')
  @ApiOperation({ summary: 'Get sync delta for user profiles' })
  getSync(@Body('_userId') userId: string, @Query('since') since?: string) {
    const sinceTime = since ? parseInt(since, 10) : 0;
    return this.usersService.getSyncDelta(userId, sinceTime);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get sessions' })
  getSessions(@Body('_userId') userId: string) {
    return this.usersService.getSessions(userId);
  }

  @Post('sessions')
  @ApiOperation({ summary: 'Create session' })
  createSession(@Body('_userId') userId: string, @Body() body: any) {
    return this.usersService.createSession(userId, body);
  }

  @Delete('sessions/:sessionId')
  @ApiOperation({ summary: 'Delete session' })
  deleteSession(@Body('_userId') userId: string, @Param('sessionId') sessionId: string) {
    return this.usersService.deleteSession(userId, sessionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public profile' })
  getUser(@Param('id') id: string, @Body('_userId') viewerId: string) {
    return this.usersService.getPublicProfile(id, viewerId);
  }

  @Post(':id/block')
  @ApiOperation({ summary: 'Block user' })
  blockUser(@Body('_userId') userId: string, @Param('id') id: string, @Body() body: BlockUserDto) {
    return this.usersService.blockUser(userId, id, body.reason);
  }

  @Delete(':id/block')
  @ApiOperation({ summary: 'Unblock user' })
  unblockUser(@Body('_userId') userId: string, @Param('id') id: string) {
    return this.usersService.unblockUser(userId, id);
  }

  @Post(':id/report')
  @ApiOperation({ summary: 'Report user' })
  reportUser(
    @Body('_userId') userId: string,
    @Param('id') id: string,
    @Body() body: ReportUserDto,
  ) {
    return this.usersService.reportUser(userId, id, body);
  }
}

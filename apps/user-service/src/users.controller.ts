import { Controller, Get, Patch, Put, Delete, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, DeleteAccountDto, UpdatePreferencesDto, BlockUserDto, ReportUserDto } from './dto';

@ApiTags('Users') @ApiBearerAuth() @Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me') @ApiOperation({ summary: 'Get current user' })
  getMe(@Body('_userId') userId: string) { return this.usersService.getMe(userId); }

  @Patch('me') @ApiOperation({ summary: 'Update current user' })
  updateMe(@Body('_userId') userId: string, @Body() body: UpdateUserDto) { return this.usersService.updateMe(userId, body); }

  @Delete('me') @ApiOperation({ summary: 'Delete account' })
  deleteMe(@Body('_userId') userId: string, @Body() body: DeleteAccountDto) { return this.usersService.deleteAccount(userId, body.password); }

  @Get(':id') @ApiOperation({ summary: 'Get public profile' })
  getUser(@Param('id') id: string, @Body('_userId') viewerId: string) { return this.usersService.getPublicProfile(id, viewerId); }

  @Get('me/preferences') @ApiOperation({ summary: 'Get preferences' })
  getPreferences(@Body('_userId') userId: string) { return this.usersService.getPreferences(userId); }

  @Put('me/preferences') @ApiOperation({ summary: 'Update preferences' })
  updatePreferences(@Body('_userId') userId: string, @Body() body: UpdatePreferencesDto) { return this.usersService.updatePreferences(userId, body); }

  @Post(':id/block') @ApiOperation({ summary: 'Block user' })
  blockUser(@Body('_userId') userId: string, @Param('id') id: string, @Body() body: BlockUserDto) { return this.usersService.blockUser(userId, id, body.reason); }

  @Delete(':id/block') @ApiOperation({ summary: 'Unblock user' })
  unblockUser(@Body('_userId') userId: string, @Param('id') id: string) { return this.usersService.unblockUser(userId, id); }

  @Get('me/blocks') @ApiOperation({ summary: 'List blocked users' })
  getBlockedUsers(@Body('_userId') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) { return this.usersService.getBlockedUsers(userId, page, limit); }

  @Post(':id/report') @ApiOperation({ summary: 'Report user' })
  reportUser(@Body('_userId') userId: string, @Param('id') id: string, @Body() body: ReportUserDto) { return this.usersService.reportUser(userId, id, body); }
}

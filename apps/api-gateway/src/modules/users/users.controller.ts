import { Controller, Get, Put, Post, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@Req() req: any) {
    return { message: 'Get me endpoint — to be implemented' };
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateMe(@Body() body: any) {
    return { message: 'Update me endpoint — to be implemented' };
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user account' })
  deleteMe() {
    return { message: 'Delete me endpoint — to be implemented' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user public profile' })
  getUser(@Param('id') id: string) {
    return { message: `Get user ${id} endpoint — to be implemented` };
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  updatePreferences(@Body() body: any) {
    return { message: 'Update preferences endpoint — to be implemented' };
  }

  @Post('block')
  @ApiOperation({ summary: 'Block a user' })
  blockUser(@Body() body: any) {
    return { message: 'Block user endpoint — to be implemented' };
  }

  @Delete('block/:userId')
  @ApiOperation({ summary: 'Unblock a user' })
  unblockUser(@Param('userId') userId: string) {
    return { message: `Unblock user ${userId} endpoint — to be implemented` };
  }
}

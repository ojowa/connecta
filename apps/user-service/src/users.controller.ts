import { Controller, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  getMe() {
    return this.usersService.getMe();
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user' })
  updateMe(@Body() body: any) {
    return this.usersService.updateMe(body);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user' })
  deleteMe() {
    return this.usersService.deleteMe();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  getUser(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update preferences' })
  updatePreferences(@Body() body: any) {
    return this.usersService.updatePreferences(body);
  }
}

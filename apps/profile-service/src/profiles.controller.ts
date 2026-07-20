import { Controller, Get, Put, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get profile' })
  getProfile(@Param('userId') userId: string) {
    return this.profilesService.getProfile(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update profile' })
  updateProfile(@Body() body: any) {
    return this.profilesService.updateProfile(body);
  }

  @Post('photos')
  @ApiOperation({ summary: 'Upload photo' })
  uploadPhoto(@Body() body: any) {
    return this.profilesService.uploadPhoto(body);
  }

  @Delete('photos/:id')
  @ApiOperation({ summary: 'Delete photo' })
  deletePhoto(@Param('id') id: string) {
    return this.profilesService.deletePhoto(id);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Submit verification' })
  verify(@Body() body: any) {
    return this.profilesService.verify(body);
  }
}

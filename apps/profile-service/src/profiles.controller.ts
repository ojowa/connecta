import { Controller, Get, Put, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto, UploadPhotoDto, ReorderPhotosDto } from './dto';

@ApiTags('Profiles') @ApiBearerAuth() @Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me') @ApiOperation({ summary: 'Get my profile' })
  getMyProfile(@Body('_userId') userId: string) { return this.profilesService.getProfile(userId); }

  @Put('me') @ApiOperation({ summary: 'Update profile' })
  updateProfile(@Body('_userId') userId: string, @Body() body: UpdateProfileDto) { return this.profilesService.updateProfile(userId, body); }

  @Get('me/photos') @ApiOperation({ summary: 'Get photos' })
  getPhotos(@Body('_userId') userId: string) { return this.profilesService.getPhotos(userId); }

  @Post('me/photos') @ApiOperation({ summary: 'Upload photo' })
  uploadPhoto(@Body('_userId') userId: string, @Body() body: UploadPhotoDto) { return this.profilesService.uploadPhoto(userId, body.url, body.isPrimary); }

  @Delete('me/photos/:photoId') @ApiOperation({ summary: 'Delete photo' })
  deletePhoto(@Body('_userId') userId: string, @Param('photoId') photoId: string) { return this.profilesService.deletePhoto(userId, photoId); }

  @Put('me/photos/order') @ApiOperation({ summary: 'Reorder photos' })
  reorderPhotos(@Body('_userId') userId: string, @Body() body: ReorderPhotosDto) { return this.profilesService.reorderPhotos(userId, body.photoIds); }

  @Put('me/photos/:photoId/primary') @ApiOperation({ summary: 'Set primary photo' })
  setPrimary(@Body('_userId') userId: string, @Param('photoId') photoId: string) { return this.profilesService.setPrimaryPhoto(userId, photoId); }

  @Get('me/interests') @ApiOperation({ summary: 'Get all interests' })
  getInterests() { return this.profilesService.getInterests(); }

  @Post('verification/request') @ApiOperation({ summary: 'Request verification' })
  requestVerification(@Body('_userId') userId: string) { return this.profilesService.requestVerification(userId); }

  @Get('verification') @ApiOperation({ summary: 'Get verification status' })
  getVerification(@Body('_userId') userId: string) { return this.profilesService.getVerificationStatus(userId); }

  @Get(':userId') @ApiOperation({ summary: 'Get user profile' })
  getProfile(@Param('userId') userId: string) { return this.profilesService.getProfile(userId); }
}

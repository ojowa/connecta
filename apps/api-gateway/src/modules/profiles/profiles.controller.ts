import { Controller, Get, Put, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('photos')
  @ApiOperation({ summary: 'Get user photos' })
  getPhotos(@Body('_userId') userId: string) {
    return this.profilesService.getPhotos(userId);
  }

  @Post('photos')
  @ApiOperation({ summary: 'Upload profile photo' })
  @ApiConsumes('multipart/form-data')
  uploadPhoto(@Body('_userId') userId: string, @Body() body: { url: string; isPrimary?: boolean }) {
    return this.profilesService.uploadPhoto(userId, body.url, body.isPrimary);
  }

  @Delete('photos/:photoId')
  @ApiOperation({ summary: 'Delete profile photo' })
  deletePhoto(@Body('_userId') userId: string, @Param('photoId') photoId: string) {
    return this.profilesService.deletePhoto(userId, photoId);
  }

  @Put('photos/order')
  @ApiOperation({ summary: 'Reorder profile photos' })
  reorderPhotos(@Body('_userId') userId: string, @Body() body: { photoIds: string[] }) {
    return this.profilesService.reorderPhotos(userId, body.photoIds);
  }

  @Put('photos/:photoId/primary')
  @ApiOperation({ summary: 'Set primary photo' })
  setPrimaryPhoto(@Body('_userId') userId: string, @Param('photoId') photoId: string) {
    return this.profilesService.setPrimaryPhoto(userId, photoId);
  }

  @Post('verification/request')
  @ApiOperation({ summary: 'Request identity verification' })
  requestVerification(@Body('_userId') userId: string) {
    return this.profilesService.requestVerification(userId);
  }

  @Get('verification')
  @ApiOperation({ summary: 'Get verification status' })
  getVerificationStatus(@Body('_userId') userId: string) {
    return this.profilesService.getVerificationStatus(userId);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user profile by ID' })
  getProfile(@Param('userId') userId: string) {
    return this.profilesService.getProfile(userId);
  }
}

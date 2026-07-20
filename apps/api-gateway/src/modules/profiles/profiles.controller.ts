import { Controller, Get, Put, Post, Delete, Body, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Profiles')
@ApiBearerAuth()
@Controller('profiles')
export class ProfilesController {
  @Get(':userId')
  @ApiOperation({ summary: 'Get user profile' })
  getProfile(@Param('userId') userId: string) {
    return { message: `Get profile ${userId} endpoint — to be implemented` };
  }

  @Put()
  @ApiOperation({ summary: 'Update profile' })
  updateProfile(@Body() body: any) {
    return { message: 'Update profile endpoint — to be implemented' };
  }

  @Post('photos')
  @ApiOperation({ summary: 'Upload profile photo' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo'))
  uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    return { message: 'Upload photo endpoint — to be implemented' };
  }

  @Delete('photos/:id')
  @ApiOperation({ summary: 'Delete profile photo' })
  deletePhoto(@Param('id') id: string) {
    return { message: `Delete photo ${id} endpoint — to be implemented` };
  }

  @Put('photos/reorder')
  @ApiOperation({ summary: 'Reorder profile photos' })
  reorderPhotos(@Body() body: any) {
    return { message: 'Reorder photos endpoint — to be implemented' };
  }

  @Post('verify')
  @ApiOperation({ summary: 'Submit photo verification' })
  verifyPhoto(@Body() body: any) {
    return { message: 'Verify photo endpoint — to be implemented' };
  }
}

import { Controller, Get, Post, Delete, Body, Param, Headers, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MediaService } from './media.service';

@ApiTags('Media')
@ApiBearerAuth()
@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo'))
  upload(@Headers('x-user-id') userId: string, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    return this.mediaService.upload(userId, body, file);
  }

  @Post('presigned-url')
  @ApiOperation({ summary: 'Get presigned URL' })
  presigned(@Headers('x-user-id') userId: string, @Body() body: any) {
    return this.mediaService.getPresignedUrl(userId, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media' })
  get(@Param('id') id: string) {
    return this.mediaService.getMedia(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media' })
  delete(@Param('id') id: string) {
    return this.mediaService.deleteMedia(id);
  }
}

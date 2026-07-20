import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MediaService } from './media.service';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  upload(@Body() body: any) {
    return this.mediaService.upload(body);
  }

  @Post('presigned-url')
  @ApiOperation({ summary: 'Get presigned URL' })
  getPresignedUrl(@Body() body: any) {
    return this.mediaService.getPresignedUrl(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media' })
  getMedia(@Param('id') id: string) {
    return this.mediaService.getMedia(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media' })
  deleteMedia(@Param('id') id: string) {
    return this.mediaService.deleteMedia(id);
  }
}

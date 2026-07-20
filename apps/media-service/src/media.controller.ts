import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MediaService } from './media.service';

@ApiTags('Media') @ApiBearerAuth() @Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload') @ApiOperation({ summary: 'Upload file' })
  upload(@Body('_userId') userId: string, @Body() body: any) { return this.mediaService.upload(userId, body); }

  @Post('presigned-url') @ApiOperation({ summary: 'Get presigned URL' })
  presigned(@Body('_userId') userId: string, @Body() body: any) { return this.mediaService.getPresignedUrl(userId, body); }

  @Get(':id') @ApiOperation({ summary: 'Get media' })
  get(@Param('id') id: string) { return this.mediaService.getMedia(id); }

  @Delete(':id') @ApiOperation({ summary: 'Delete media' })
  delete(@Param('id') id: string) { return this.mediaService.deleteMedia(id); }
}

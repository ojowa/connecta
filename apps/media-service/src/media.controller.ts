import { Controller, Get, Post, Delete, Body, Param, Headers, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
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

  @Get('config')
  @ApiOperation({ summary: 'Get storage provider config status' })
  getConfig() {
    return this.mediaService.getStorageConfig();
  }

  @Post('reload')
  @ApiOperation({ summary: 'Reload storage provider (after config change)' })
  reload() {
    return this.mediaService.reloadStorage();
  }

  @Get('files/:key(*)')
  @ApiOperation({ summary: 'Serve local file' })
  serveFile(@Param('key') key: string, @Res() res: Response) {
    const path = require('path');
    const uploadDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, key);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.sendFile(filePath);
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

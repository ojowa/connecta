import { Controller, Get, Post, Delete, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { message: 'Upload file endpoint — to be implemented' };
  }

  @Post('presigned-url')
  @ApiOperation({ summary: 'Get presigned URL for direct upload' })
  getPresignedUrl() {
    return { message: 'Presigned URL endpoint — to be implemented' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  getMedia(@Param('id') id: string) {
    return { message: `Get media ${id} — to be implemented` };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media' })
  deleteMedia(@Param('id') id: string) {
    return { message: `Delete media ${id} — to be implemented` };
  }
}

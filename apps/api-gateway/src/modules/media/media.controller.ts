import { Controller, Get, Post, Delete, Param, Body, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const MEDIA_SERVICE = process.env.MEDIA_SERVICE_URL || 'http://localhost:3007';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly http: HttpService) {}

  private authHeaders(req: Request) {
    return { authorization: req.headers.authorization };
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  async uploadFile(@Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${MEDIA_SERVICE}/media/upload`, req, {
        headers: {
          ...this.authHeaders(req),
          'content-type': req.headers['content-type'],
        },
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('presigned-url')
  @ApiOperation({ summary: 'Get presigned URL for direct upload' })
  async getPresignedUrl(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${MEDIA_SERVICE}/media/presigned-url`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  async getMedia(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${MEDIA_SERVICE}/media/${id}`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media' })
  async deleteMedia(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.delete(`${MEDIA_SERVICE}/media/${id}`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }
}

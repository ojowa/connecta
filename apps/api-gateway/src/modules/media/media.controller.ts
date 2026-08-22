import { Controller, Get, Post, Delete, Param, Body, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { proxyGet, proxyPost, proxyDelete, handleError } from '../../helpers/proxy.helper';
import { firstValueFrom } from 'rxjs';

const MEDIA_SERVICE = process.env.MEDIA_SERVICE_URL;

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly http: HttpService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  async uploadFile(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await firstValueFrom(
        this.http.post(`${MEDIA_SERVICE}/media/upload`, req, {
          headers: {
            authorization: req.headers.authorization,
            'content-type': req.headers['content-type'],
          },
        }),
      );
      return res.status(result.status).json(result.data);
    } catch (err) {
      return handleError(err, `${MEDIA_SERVICE}/media/upload`, res);
    }
  }

  @Post('presigned-url')
  @ApiOperation({ summary: 'Get presigned URL for direct upload' })
  async getPresignedUrl(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${MEDIA_SERVICE}/media/presigned-url`, body, req, res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  async getMedia(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${MEDIA_SERVICE}/media/${id}`, req, res);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media' })
  async deleteMedia(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return proxyDelete(this.http, `${MEDIA_SERVICE}/media/${id}`, req, res);
  }
}

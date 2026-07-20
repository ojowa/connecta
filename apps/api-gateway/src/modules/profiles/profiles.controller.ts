import { Controller, Get, Put, Post, Delete, Body, Param, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const PROFILE_SERVICE = process.env.PROFILE_SERVICE_URL || 'http://localhost:3003';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfilesController {
  constructor(private readonly http: HttpService) {}

  private authHeaders(req: Request) {
    return { authorization: req.headers.authorization };
  }

  @Get('photos')
  @ApiOperation({ summary: 'Get user photos' })
  async getPhotos(@Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${PROFILE_SERVICE}/profiles/me/photos`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('photos')
  @ApiOperation({ summary: 'Upload profile photo' })
  @ApiConsumes('multipart/form-data')
  async uploadPhoto(@Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${PROFILE_SERVICE}/profiles/me/photos`, req, {
        headers: {
          ...this.authHeaders(req),
          'content-type': req.headers['content-type'],
        },
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Delete('photos/:photoId')
  @ApiOperation({ summary: 'Delete profile photo' })
  async deletePhoto(@Param('photoId') photoId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.delete(`${PROFILE_SERVICE}/profiles/me/photos/${photoId}`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Put('photos/order')
  @ApiOperation({ summary: 'Reorder profile photos' })
  async reorderPhotos(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.put(`${PROFILE_SERVICE}/profiles/me/photos/order`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Put('photos/:photoId/primary')
  @ApiOperation({ summary: 'Set primary photo' })
  async setPrimaryPhoto(@Param('photoId') photoId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.put(`${PROFILE_SERVICE}/profiles/me/photos/${photoId}/primary`, null, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('verification/request')
  @ApiOperation({ summary: 'Request identity verification' })
  @ApiConsumes('multipart/form-data')
  async requestVerification(@Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${PROFILE_SERVICE}/profiles/verification/request`, req, {
        headers: {
          ...this.authHeaders(req),
          'content-type': req.headers['content-type'],
        },
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('verification')
  @ApiOperation({ summary: 'Get verification status' })
  async getVerificationStatus(@Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${PROFILE_SERVICE}/profiles/verification`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }
}

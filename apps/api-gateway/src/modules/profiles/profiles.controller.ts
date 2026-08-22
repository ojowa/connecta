import { Controller, Get, Put, Post, Delete, Body, Param, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { proxyGet, proxyPost, proxyPut, proxyDelete, handleError } from '../../helpers/proxy.helper';
import { firstValueFrom } from 'rxjs';

const PROFILE_SERVICE = process.env.PROFILE_SERVICE_URL;

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfilesController {
  constructor(private readonly http: HttpService) {}

  @Get('photos')
  @ApiOperation({ summary: 'Get user photos' })
  async getPhotos(@Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${PROFILE_SERVICE}/profiles/me/photos`, req, res);
  }

  @Post('photos')
  @ApiOperation({ summary: 'Upload profile photo' })
  @ApiConsumes('multipart/form-data')
  async uploadPhoto(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await firstValueFrom(
        this.http.post(`${PROFILE_SERVICE}/profiles/me/photos`, req, {
          headers: {
            authorization: req.headers.authorization,
            'content-type': req.headers['content-type'],
          },
        }),
      );
      return res.status(result.status).json(result.data);
    } catch (err) {
      return handleError(err, `${PROFILE_SERVICE}/profiles/me/photos`, res);
    }
  }

  @Delete('photos/:photoId')
  @ApiOperation({ summary: 'Delete profile photo' })
  async deletePhoto(@Param('photoId') photoId: string, @Req() req: Request, @Res() res: Response) {
    return proxyDelete(this.http, `${PROFILE_SERVICE}/profiles/me/photos/${photoId}`, req, res);
  }

  @Put('photos/order')
  @ApiOperation({ summary: 'Reorder profile photos' })
  async reorderPhotos(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPut(this.http, `${PROFILE_SERVICE}/profiles/me/photos/order`, body, req, res);
  }

  @Put('photos/:photoId/primary')
  @ApiOperation({ summary: 'Set primary photo' })
  async setPrimaryPhoto(@Param('photoId') photoId: string, @Req() req: Request, @Res() res: Response) {
    return proxyPut(this.http, `${PROFILE_SERVICE}/profiles/me/photos/${photoId}/primary`, null, req, res);
  }

  @Post('verification/request')
  @ApiOperation({ summary: 'Request identity verification' })
  @ApiConsumes('multipart/form-data')
  async requestVerification(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await firstValueFrom(
        this.http.post(`${PROFILE_SERVICE}/profiles/verification/request`, req, {
          headers: {
            authorization: req.headers.authorization,
            'content-type': req.headers['content-type'],
          },
        }),
      );
      return res.status(result.status).json(result.data);
    } catch (err) {
      return handleError(err, `${PROFILE_SERVICE}/profiles/verification/request`, res);
    }
  }

  @Get('verification')
  @ApiOperation({ summary: 'Get verification status' })
  async getVerificationStatus(@Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${PROFILE_SERVICE}/profiles/verification`, req, res);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user profile by ID' })
  async getProfile(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${PROFILE_SERVICE}/profiles/${userId}`, req, res);
  }
}

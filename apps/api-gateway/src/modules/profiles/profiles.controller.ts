import { Controller, Get, Put, Post, Delete, Body, Param, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const PROFILE_SERVICE = process.env.PROFILE_SERVICE_URL || 'http://localhost:3003';

@ApiTags('Profiles')
@ApiBearerAuth()
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly http: HttpService) {}

  private authHeaders(req: Request) {
    return { authorization: req.headers.authorization };
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${PROFILE_SERVICE}/profiles/${userId}`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Put()
  @ApiOperation({ summary: 'Update profile' })
  async updateProfile(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.put(`${PROFILE_SERVICE}/profiles`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('photos')
  @ApiOperation({ summary: 'Upload profile photo' })
  @ApiConsumes('multipart/form-data')
  async uploadPhoto(@Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${PROFILE_SERVICE}/profiles/photos`, req, {
        headers: {
          ...this.authHeaders(req),
          'content-type': req.headers['content-type'],
        },
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Delete('photos/:id')
  @ApiOperation({ summary: 'Delete profile photo' })
  async deletePhoto(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.delete(`${PROFILE_SERVICE}/profiles/photos/${id}`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Put('photos/reorder')
  @ApiOperation({ summary: 'Reorder profile photos' })
  async reorderPhotos(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.put(`${PROFILE_SERVICE}/profiles/photos/reorder`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Submit photo verification' })
  async verifyPhoto(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${PROFILE_SERVICE}/profiles/verify`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get(':userId/interests')
  @ApiOperation({ summary: 'Get profile interests' })
  async getInterests(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${PROFILE_SERVICE}/profiles/${userId}/interests`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('interests')
  @ApiOperation({ summary: 'Add interests to profile' })
  async addInterests(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${PROFILE_SERVICE}/profiles/interests`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }
}

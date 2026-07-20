import { Controller, Get, Post, Delete, Body, Param, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3002';

@ApiTags('Crypto')
@ApiBearerAuth()
@Controller('crypto')
export class CryptoController {
  constructor(private readonly http: HttpService) {}

  private authHeaders(req: Request) {
    return { authorization: req.headers.authorization };
  }

  @Post('prekeys')
  @ApiOperation({ summary: 'Upload pre-key bundle (identity key, signed pre-key, one-time pre-keys)' })
  async uploadPreKeyBundle(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${USER_SERVICE}/crypto/prekeys`, body, {
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('prekeys/:userId')
  @ApiOperation({ summary: 'Get pre-key bundle for a user' })
  async getPreKeyBundle(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${USER_SERVICE}/crypto/prekeys/${userId}`, {
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('prekeys/claim/:keyId')
  @ApiOperation({ summary: 'Claim a one-time pre-key' })
  async claimOneTimePreKey(@Param('keyId') keyId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${USER_SERVICE}/crypto/prekeys/claim/${keyId}`, null, {
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Delete('prekeys/:keyId')
  @ApiOperation({ summary: 'Delete a consumed one-time pre-key' })
  async deleteOneTimePreKey(@Param('keyId') keyId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.delete(`${USER_SERVICE}/crypto/prekeys/${keyId}`, {
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('sessions/:userId')
  @ApiOperation({ summary: 'Get active sessions for a user' })
  async getActiveSessions(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${USER_SERVICE}/crypto/sessions/${userId}`, {
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('backup')
  @ApiOperation({ summary: 'Upload encrypted key backup' })
  async uploadBackup(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${USER_SERVICE}/crypto/backup`, body, {
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('backup')
  @ApiOperation({ summary: 'Get encrypted key backup' })
  async getBackup(@Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${USER_SERVICE}/crypto/backup`, {
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }
}

import { Controller, Get, Post, Delete, Body, Param, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { proxyGet, proxyPost, proxyDelete } from '../../helpers/proxy.helper';

const USER_SERVICE = process.env.USER_SERVICE_URL;

@ApiTags('Crypto')
@ApiBearerAuth()
@Controller('crypto')
export class CryptoController {
  constructor(private readonly http: HttpService) {}

  @Post('prekeys')
  @ApiOperation({ summary: 'Upload pre-key bundle (identity key, signed pre-key, one-time pre-keys)' })
  async uploadPreKeyBundle(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${USER_SERVICE}/crypto/prekeys`, body, req, res);
  }

  @Get('prekeys/:userId')
  @ApiOperation({ summary: 'Get pre-key bundle for a user' })
  async getPreKeyBundle(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${USER_SERVICE}/crypto/prekeys/${userId}`, req, res);
  }

  @Post('prekeys/claim/:keyId')
  @ApiOperation({ summary: 'Claim a one-time pre-key' })
  async claimOneTimePreKey(@Param('keyId') keyId: string, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${USER_SERVICE}/crypto/prekeys/claim/${keyId}`, null, req, res);
  }

  @Delete('prekeys/:keyId')
  @ApiOperation({ summary: 'Delete a consumed one-time pre-key' })
  async deleteOneTimePreKey(@Param('keyId') keyId: string, @Req() req: Request, @Res() res: Response) {
    return proxyDelete(this.http, `${USER_SERVICE}/crypto/prekeys/${keyId}`, req, res);
  }

  @Get('sessions/:userId')
  @ApiOperation({ summary: 'Get active sessions for a user' })
  async getActiveSessions(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${USER_SERVICE}/crypto/sessions/${userId}`, req, res);
  }

  @Post('backup')
  @ApiOperation({ summary: 'Upload encrypted key backup' })
  async uploadBackup(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${USER_SERVICE}/crypto/backup`, body, req, res);
  }

  @Get('backup')
  @ApiOperation({ summary: 'Get encrypted key backup' })
  async getBackup(@Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${USER_SERVICE}/crypto/backup`, req, res);
  }
}

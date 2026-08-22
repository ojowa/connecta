import { Controller, Get, Post, Delete, Body, Param, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { proxyPost, proxyGet, proxyDelete } from '../../helpers/proxy.helper';

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly http: HttpService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${AUTH_SERVICE}/auth/register`, body, req, res);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with credentials' })
  async login(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${AUTH_SERVICE}/auth/login`, body, req, res);
  }

  @Post('otp/send')
  @ApiOperation({ summary: 'Send OTP' })
  async sendOtp(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${AUTH_SERVICE}/auth/otp/send`, body, req, res);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP code' })
  async verifyOtp(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${AUTH_SERVICE}/auth/otp/verify`, body, req, res);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${AUTH_SERVICE}/auth/refresh`, body, req, res);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke tokens' })
  async logout(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${AUTH_SERVICE}/auth/logout`, body, req, res);
  }

  @Get('devices')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List registered devices' })
  async listDevices(@Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${AUTH_SERVICE}/auth/devices`, req, res);
  }

  @Delete('devices/:deviceId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a device session' })
  async revokeDevice(
    @Param('deviceId') deviceId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return proxyDelete(this.http, `${AUTH_SERVICE}/auth/devices/${deviceId}`, req, res);
  }

  @Post('biometric/register')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register biometric authentication' })
  async registerBiometric(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${AUTH_SERVICE}/auth/biometric/register`, body, req, res);
  }

  @Post('biometric/login')
  @ApiOperation({ summary: 'Login with biometric signature' })
  async biometricLogin(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${AUTH_SERVICE}/auth/biometric/login`, body, req, res);
  }

  @Delete('biometric/:biometricId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove biometric authentication' })
  async removeBiometric(
    @Param('biometricId') biometricId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return proxyDelete(this.http, `${AUTH_SERVICE}/auth/biometric/${biometricId}`, req, res);
  }

  @Post('password/forgot')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${AUTH_SERVICE}/auth/password/forgot`, body, req, res);
  }

  @Post('password/reset')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${AUTH_SERVICE}/auth/password/reset`, body, req, res);
  }
}

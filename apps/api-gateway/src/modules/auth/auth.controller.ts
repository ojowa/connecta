import { Controller, Get, Post, Delete, Body, Param, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly http: HttpService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() body: any, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${AUTH_SERVICE}/auth/register`, body),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with credentials' })
  async login(@Body() body: any, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${AUTH_SERVICE}/auth/login`, body),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('otp/send')
  @ApiOperation({ summary: 'Send OTP' })
  async sendOtp(@Body() body: any, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${AUTH_SERVICE}/auth/otp/send`, body),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP code' })
  async verifyOtp(@Body() body: any, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${AUTH_SERVICE}/auth/otp/verify`, body),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: any, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${AUTH_SERVICE}/auth/refresh`, body),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke tokens' })
  async logout(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${AUTH_SERVICE}/auth/logout`, body, {
        headers: { authorization: req.headers.authorization },
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('devices')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List registered devices' })
  async listDevices(@Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${AUTH_SERVICE}/auth/devices`, {
        headers: { authorization: req.headers.authorization },
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Delete('devices/:deviceId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a device session' })
  async revokeDevice(@Param('deviceId') deviceId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.delete(`${AUTH_SERVICE}/auth/devices/${deviceId}`, {
        headers: { authorization: req.headers.authorization },
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('biometric/register')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register biometric authentication' })
  async registerBiometric(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${AUTH_SERVICE}/auth/biometric/register`, body, {
        headers: { authorization: req.headers.authorization },
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('biometric/login')
  @ApiOperation({ summary: 'Login with biometric signature' })
  async biometricLogin(@Body() body: any, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${AUTH_SERVICE}/auth/biometric/login`, body),
    );
    return res.status(result.status).json(result.data);
  }

  @Delete('biometric/:biometricId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove biometric authentication' })
  async removeBiometric(@Param('biometricId') biometricId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.delete(`${AUTH_SERVICE}/auth/biometric/${biometricId}`, {
        headers: { authorization: req.headers.authorization },
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('password/forgot')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() body: any, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${AUTH_SERVICE}/auth/password/forgot`, body),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('password/reset')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() body: any, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${AUTH_SERVICE}/auth/password/reset`, body),
    );
    return res.status(result.status).json(result.data);
  }
}

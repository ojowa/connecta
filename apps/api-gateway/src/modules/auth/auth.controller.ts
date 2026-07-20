import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

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
  @ApiOperation({ summary: 'Send OTP to phone' })
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

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() body: any, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${AUTH_SERVICE}/auth/forgot-password`, body),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() body: any, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${AUTH_SERVICE}/auth/reset-password`, body),
    );
    return res.status(result.status).json(result.data);
  }
}

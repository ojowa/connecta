import { Controller, Get, Post, Delete, Body, Param, Req, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with credentials' })
  login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post('otp/send')
  @ApiOperation({ summary: 'Send OTP' })
  sendOtp(@Body() body: any) {
    return this.authService.sendOtp(body);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP code' })
  verifyOtp(@Body() body: any) {
    return this.authService.verifyOtp(body);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() body: any) {
    return this.authService.refresh(body);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke tokens' })
  async logout(@Headers('x-user-id') userId: string, @Body() body: any) {
    return this.authService.logout({ userId, ...body });
  }

  @Get('devices')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List registered devices' })
  getDevices(@Headers('x-user-id') userId: string) {
    return this.authService.getDevices(userId);
  }

  @Delete('devices/:deviceId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a device session' })
  revokeDevice(@Headers('x-user-id') userId: string, @Param('deviceId') deviceId: string) {
    return this.authService.revokeDevice(userId, deviceId);
  }

  @Post('biometric/register')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register biometric authentication' })
  registerBiometric(@Headers('x-user-id') userId: string, @Body() body: any) {
    return this.authService.registerBiometric(userId, body);
  }

  @Post('biometric/login')
  @ApiOperation({ summary: 'Login with biometric signature' })
  biometricLogin(@Body() body: any) {
    return this.authService.biometricLogin(body);
  }

  @Delete('biometric/:biometricId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove biometric authentication' })
  removeBiometric(@Headers('x-user-id') userId: string, @Param('biometricId') biometricId: string) {
    return this.authService.removeBiometric(userId, biometricId);
  }

  @Post('password/forgot')
  @ApiOperation({ summary: 'Request password reset' })
  forgotPassword(@Body() body: any) {
    return this.authService.forgotPassword(body);
  }

  @Post('password/reset')
  @ApiOperation({ summary: 'Reset password with token' })
  resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body);
  }

  @Post('password/change')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password (requires current password)' })
  changePassword(@Headers('x-user-id') userId: string, @Body() body: any) {
    return this.authService.changePassword(userId, body);
  }

  @Get('2fa/settings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get 2FA settings' })
  get2FASettings(@Headers('x-user-id') userId: string) {
    return this.authService.get2FASettings(userId);
  }

  @Post('2fa/toggle')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable or disable 2FA' })
  toggle2FA(@Headers('x-user-id') userId: string, @Body() body: any) {
    return this.authService.toggle2FA(userId, body);
  }

  @Post('2fa/setup')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup authenticator app (generates secret + QR code)' })
  setup2FA(@Headers('x-user-id') userId: string) {
    return this.authService.setup2FA(userId);
  }

  @Post('2fa/verify-setup')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify code to enable authenticator 2FA' })
  verify2FASetup(@Headers('x-user-id') userId: string, @Body('code') code: string) {
    return this.authService.verify2FASetup(userId, code);
  }

  @Post('2fa/verify')
  @ApiOperation({ summary: 'Verify 2FA code during login' })
  verify2FALogin(@Body('tempToken') tempToken: string, @Body('code') code: string) {
    return this.authService.verify2FALogin(tempToken, code);
  }

  @Post('2fa/disable')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable 2FA' })
  disable2FA(@Headers('x-user-id') userId: string, @Body('code') code: string) {
    return this.authService.disable2FA(userId, code);
  }
}

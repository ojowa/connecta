import { Controller, Post, Body, Get, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @HttpCode(HttpStatus.CREATED)
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
  @ApiOperation({ summary: 'Verify OTP' })
  verifyOtp(@Body() body: any) {
    return this.authService.verifyOtp(body);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh token' })
  refresh(@Body() body: any) {
    return this.authService.refresh(body);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  @ApiBearerAuth()
  logout(@Body() body: any) {
    return this.authService.logout(body);
  }

  @Get('devices')
  @ApiOperation({ summary: 'List devices' })
  @ApiBearerAuth()
  getDevices(@Body('_userId') userId: string) {
    return this.authService.getDevices(userId);
  }

  @Delete('devices/:deviceId')
  @ApiOperation({ summary: 'Revoke device' })
  @ApiBearerAuth()
  revokeDevice(@Param('deviceId') deviceId: string, @Body('_userId') userId: string) {
    return this.authService.revokeDevice(userId, deviceId);
  }

  @Post('biometric/register')
  @ApiOperation({ summary: 'Register biometric authentication' })
  @ApiBearerAuth()
  registerBiometric(@Body('_userId') userId: string, @Body() body: any) {
    return this.authService.registerBiometric(userId, body);
  }

  @Post('biometric/login')
  @ApiOperation({ summary: 'Biometric login' })
  biometricLogin(@Body() body: any) {
    return this.authService.biometricLogin(body);
  }

  @Delete('biometric/:biometricId')
  @ApiOperation({ summary: 'Remove biometric authentication' })
  @ApiBearerAuth()
  removeBiometric(@Param('biometricId') biometricId: string, @Body('_userId') userId: string) {
    return this.authService.removeBiometric(userId, biometricId);
  }

  @Post('password/forgot')
  @ApiOperation({ summary: 'Request password reset' })
  forgotPassword(@Body() body: any) {
    return this.authService.forgotPassword(body);
  }

  @Post('password/reset')
  @ApiOperation({ summary: 'Reset password' })
  resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body);
  }
}

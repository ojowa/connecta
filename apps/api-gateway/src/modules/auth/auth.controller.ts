import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() body: any) {
    return { message: 'Register endpoint — to be implemented' };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with credentials' })
  login(@Body() body: any) {
    return { message: 'Login endpoint — to be implemented' };
  }

  @Post('otp/send')
  @ApiOperation({ summary: 'Send OTP to phone' })
  sendOtp(@Body() body: any) {
    return { message: 'Send OTP endpoint — to be implemented' };
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP code' })
  verifyOtp(@Body() body: any) {
    return { message: 'Verify OTP endpoint — to be implemented' };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() body: any) {
    return { message: 'Refresh token endpoint — to be implemented' };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and revoke tokens' })
  logout(@Body() body: any) {
    return { message: 'Logout endpoint — to be implemented' };
  }
}

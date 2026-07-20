import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
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
  @ApiOperation({ summary: 'Send OTP to phone' })
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
  @ApiOperation({ summary: 'Logout and revoke tokens' })
  logout(@Body() body: any) {
    return this.authService.logout(body);
  }
}

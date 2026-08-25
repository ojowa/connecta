import { Controller, Get, Post, Body, Query, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  login(@Body() body: any) {
    return this.adminService.login(body.email, body.password);
  }

  private verifyAuth(authHeader?: string) {
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedException('Missing token');
    const token = authHeader.slice(7);
    const payload = this.adminService.verifyToken(token);
    if (!payload) throw new UnauthorizedException('Invalid token');
    return payload;
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard stats' })
  getDashboard(@Headers('authorization') auth: string, @Query('period') period?: string) {
    this.verifyAuth(auth);
    return this.adminService.getDashboard(period);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get analytics data' })
  getAnalytics(@Headers('authorization') auth: string, @Query('period') period?: string) {
    this.verifyAuth(auth);
    return this.adminService.getAnalytics(period);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  getUsers(@Headers('authorization') auth: string, @Query('page') page?: string, @Query('limit') limit?: string, @Query('status') status?: string) {
    this.verifyAuth(auth);
    return this.adminService.getUsers(parseInt(page || '1'), parseInt(limit || '20'), status);
  }

  @Post('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend user' })
  suspendUser(@Headers('authorization') auth: string, @Param('id') id: string, @Body() body: any) {
    this.verifyAuth(auth);
    return this.adminService.suspendUser(id, body.reason);
  }

  @Post('users/:id/activate')
  @ApiOperation({ summary: 'Activate user' })
  activateUser(@Headers('authorization') auth: string, @Param('id') id: string) {
    this.verifyAuth(auth);
    return this.adminService.activateUser(id);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get all reports' })
  getReports(@Headers('authorization') auth: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    this.verifyAuth(auth);
    return this.adminService.getReports(parseInt(page || '1'), parseInt(limit || '20'));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get platform stats' })
  getStats(@Headers('authorization') auth: string) {
    this.verifyAuth(auth);
    return this.adminService.getStats();
  }
}

import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
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

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard stats' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  getUsers(@Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: string) {
    return this.adminService.getUsers(page, limit, status);
  }

  @Post('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend user' })
  suspendUser(@Param('id') id: string, @Body() body: any) {
    return this.adminService.suspendUser(id, body.reason);
  }

  @Post('users/:id/activate')
  @ApiOperation({ summary: 'Activate user' })
  activateUser(@Param('id') id: string) {
    return this.adminService.activateUser(id);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get all reports' })
  getReports(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getReports(page, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get platform stats' })
  getStats() {
    return this.adminService.getStats();
  }
}

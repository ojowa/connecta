import { Controller, Get, Put, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  login(@Body() body: any) {
    return this.adminService.login(body);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get users' })
  getUsers(@Query() query: any) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user' })
  getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Put('users/:id/status')
  @ApiOperation({ summary: 'Update user status' })
  updateUserStatus(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateUserStatus(id, body);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get reports' })
  getReports(@Query() query: any) {
    return this.adminService.getReports(query);
  }

  @Put('reports/:id/action')
  @ApiOperation({ summary: 'Take action on report' })
  takeReportAction(@Param('id') id: string, @Body() body: any) {
    return this.adminService.takeReportAction(id, body);
  }

  @Get('audit-log')
  @ApiOperation({ summary: 'Get audit log' })
  getAuditLog(@Query() query: any) {
    return this.adminService.getAuditLog(query);
  }
}

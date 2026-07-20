import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Admin') @Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login') @ApiOperation({ summary: 'Admin login' })
  login(@Body() body: any) { return this.adminService.login(body); }

  @Post('2fa/verify') @ApiOperation({ summary: 'Verify admin 2FA code' })
  verify2fa(@Body() body: any) { return this.adminService.verify2fa(body); }

  @Get('dashboard') @ApiOperation({ summary: 'Dashboard' }) @ApiBearerAuth()
  dashboard(@Query('period') period?: string) { return this.adminService.getDashboard(period); }

  @Get('users') @ApiOperation({ summary: 'List users' }) @ApiBearerAuth()
  getUsers(@Query() query: any) { return this.adminService.getUsers(query); }

  @Get('users/:id') @ApiOperation({ summary: 'User detail' }) @ApiBearerAuth()
  getUser(@Param('id') id: string) { return this.adminService.getUserDetail(id); }

  @Post('users/:id/suspend') @ApiOperation({ summary: 'Suspend user' }) @ApiBearerAuth()
  suspend(@Param('id') id: string, @Body() body: any) { return this.adminService.suspendUser(id, body); }

  @Post('users/:id/ban') @ApiOperation({ summary: 'Ban user' }) @ApiBearerAuth()
  ban(@Param('id') id: string, @Body() body: any) { return this.adminService.banUser(id, body); }

  @Post('users/:id/unsuspend') @ApiOperation({ summary: 'Unsuspend user' }) @ApiBearerAuth()
  unsuspend(@Param('id') id: string) { return this.adminService.unsuspendUser(id); }

  @Get('reports') @ApiOperation({ summary: 'List reports' }) @ApiBearerAuth()
  getReports(@Query() query: any) { return this.adminService.getReports(query); }

  @Post('reports/:id/resolve') @ApiOperation({ summary: 'Resolve report' }) @ApiBearerAuth()
  resolveReport(@Param('id') id: string, @Body() body: any) { return this.adminService.resolveReport(id, body); }

  @Get('audit-log') @ApiOperation({ summary: 'Audit log' }) @ApiBearerAuth()
  getAuditLog(@Query() query: any) { return this.adminService.getAuditLog(query); }

  @Get('settings') @ApiOperation({ summary: 'Get settings' }) @ApiBearerAuth()
  getSettings() { return this.adminService.getSettings(); }

  @Put('settings') @ApiOperation({ summary: 'Update settings' }) @ApiBearerAuth()
  updateSettings(@Body() body: any) { return this.adminService.updateSettings(body); }

  @Get('analytics') @ApiOperation({ summary: 'Get platform analytics' }) @ApiBearerAuth()
  getAnalytics(@Query() query: any) { return this.adminService.getAnalytics(query); }

  @Post('broadcast') @ApiOperation({ summary: 'Send broadcast notification' }) @ApiBearerAuth()
  broadcast(@Body() body: any) { return this.adminService.broadcast(body); }
}

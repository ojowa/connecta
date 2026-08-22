import { Controller, Get, Put, Post, Body, Param, Query, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { proxyGet, proxyPost, proxyPut } from '../../helpers/proxy.helper';

const ADMIN_SERVICE = process.env.ADMIN_SERVICE_URL;

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly http: HttpService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  async login(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${ADMIN_SERVICE}/admin/login`, body, req, res);
  }

  @Post('2fa/verify')
  @ApiOperation({ summary: 'Verify admin 2FA code' })
  async verify2fa(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${ADMIN_SERVICE}/admin/2fa/verify`, body, req, res);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard metrics' })
  @ApiBearerAuth()
  async getDashboard(@Query('period') period: string, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${ADMIN_SERVICE}/admin/dashboard`, req, res);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin)' })
  @ApiBearerAuth()
  async getUsers(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${ADMIN_SERVICE}/admin/users`, req, res);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details (admin)' })
  @ApiBearerAuth()
  async getUser(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${ADMIN_SERVICE}/admin/users/${id}`, req, res);
  }

  @Post('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend user' })
  @ApiBearerAuth()
  async suspendUser(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${ADMIN_SERVICE}/admin/users/${id}/suspend`, body, req, res);
  }

  @Post('users/:id/ban')
  @ApiOperation({ summary: 'Ban user' })
  @ApiBearerAuth()
  async banUser(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${ADMIN_SERVICE}/admin/users/${id}/ban`, body, req, res);
  }

  @Post('users/:id/unsuspend')
  @ApiOperation({ summary: 'Unsuspend user' })
  @ApiBearerAuth()
  async unsuspendUser(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${ADMIN_SERVICE}/admin/users/${id}/unsuspend`, body, req, res);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get reports queue' })
  @ApiBearerAuth()
  async getReports(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${ADMIN_SERVICE}/admin/reports`, req, res);
  }

  @Post('reports/:id/resolve')
  @ApiOperation({ summary: 'Resolve a report' })
  @ApiBearerAuth()
  async resolveReport(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${ADMIN_SERVICE}/admin/reports/${id}/resolve`, body, req, res);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get platform analytics' })
  @ApiBearerAuth()
  async getAnalytics(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${ADMIN_SERVICE}/admin/analytics`, req, res);
  }

  @Get('audit-log')
  @ApiOperation({ summary: 'Get admin audit log' })
  @ApiBearerAuth()
  async getAuditLog(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${ADMIN_SERVICE}/admin/audit-log`, req, res);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get system settings' })
  @ApiBearerAuth()
  async getSettings(@Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${ADMIN_SERVICE}/admin/settings`, req, res);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update system settings' })
  @ApiBearerAuth()
  async updateSettings(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPut(this.http, `${ADMIN_SERVICE}/admin/settings`, body, req, res);
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Send broadcast notification' })
  @ApiBearerAuth()
  async broadcast(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${ADMIN_SERVICE}/admin/broadcast`, body, req, res);
  }
}

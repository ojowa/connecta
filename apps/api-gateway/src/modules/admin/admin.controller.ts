import { Controller, Get, Put, Post, Body, Param, Query, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const ADMIN_SERVICE = process.env.ADMIN_SERVICE_URL || 'http://localhost:3011';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly http: HttpService) {}

  private authHeaders(req: Request) {
    return { authorization: req.headers.authorization };
  }

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  async login(@Body() body: any, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${ADMIN_SERVICE}/admin/login`, body),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('2fa/verify')
  @ApiOperation({ summary: 'Verify admin 2FA code' })
  async verify2fa(@Body() body: any, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${ADMIN_SERVICE}/admin/2fa/verify`, body),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard metrics' })
  @ApiBearerAuth()
  async getDashboard(@Query('period') period: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${ADMIN_SERVICE}/admin/dashboard`, {
        params: { period },
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin)' })
  @ApiBearerAuth()
  async getUsers(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${ADMIN_SERVICE}/admin/users`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details (admin)' })
  @ApiBearerAuth()
  async getUser(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${ADMIN_SERVICE}/admin/users/${id}`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend user' })
  @ApiBearerAuth()
  async suspendUser(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${ADMIN_SERVICE}/admin/users/${id}/suspend`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('users/:id/ban')
  @ApiOperation({ summary: 'Ban user' })
  @ApiBearerAuth()
  async banUser(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${ADMIN_SERVICE}/admin/users/${id}/ban`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('users/:id/unsuspend')
  @ApiOperation({ summary: 'Unsuspend user' })
  @ApiBearerAuth()
  async unsuspendUser(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${ADMIN_SERVICE}/admin/users/${id}/unsuspend`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get reports queue' })
  @ApiBearerAuth()
  async getReports(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${ADMIN_SERVICE}/admin/reports`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('reports/:id/resolve')
  @ApiOperation({ summary: 'Resolve a report' })
  @ApiBearerAuth()
  async resolveReport(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${ADMIN_SERVICE}/admin/reports/${id}/resolve`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get platform analytics' })
  @ApiBearerAuth()
  async getAnalytics(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${ADMIN_SERVICE}/admin/analytics`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('audit-log')
  @ApiOperation({ summary: 'Get admin audit log' })
  @ApiBearerAuth()
  async getAuditLog(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${ADMIN_SERVICE}/admin/audit-log`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get system settings' })
  @ApiBearerAuth()
  async getSettings(@Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${ADMIN_SERVICE}/admin/settings`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update system settings' })
  @ApiBearerAuth()
  async updateSettings(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.put(`${ADMIN_SERVICE}/admin/settings`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Send broadcast notification' })
  @ApiBearerAuth()
  async broadcast(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${ADMIN_SERVICE}/admin/broadcast`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }
}

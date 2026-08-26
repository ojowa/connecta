import { Controller, Get, Post, Put, Body, Query, Param, Headers, UnauthorizedException } from '@nestjs/common';
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

  @Post('users/:id/ban')
  @ApiOperation({ summary: 'Ban user' })
  banUser(@Headers('authorization') auth: string, @Param('id') id: string, @Body() body: any) {
    this.verifyAuth(auth);
    return this.adminService.banUser(id, body.reason);
  }

  @Post('users/:id/unsuspend')
  @ApiOperation({ summary: 'Unsuspend user' })
  unsuspendUser(@Headers('authorization') auth: string, @Param('id') id: string) {
    this.verifyAuth(auth);
    return this.adminService.activateUser(id);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  getUser(@Headers('authorization') auth: string, @Param('id') id: string) {
    this.verifyAuth(auth);
    return this.adminService.getUser(id);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get all reports' })
  getReports(@Headers('authorization') auth: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    this.verifyAuth(auth);
    return this.adminService.getReports(parseInt(page || '1'), parseInt(limit || '20'));
  }

  @Post('reports/:id/resolve')
  @ApiOperation({ summary: 'Resolve a report' })
  resolveReport(@Headers('authorization') auth: string, @Param('id') id: string, @Body() body: any) {
    this.verifyAuth(auth);
    return this.adminService.resolveReport(id, body);
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Send broadcast notification' })
  broadcast(@Headers('authorization') auth: string, @Body() body: any) {
    this.verifyAuth(auth);
    return this.adminService.broadcast(body);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get platform stats' })
  getStats(@Headers('authorization') auth: string) {
    this.verifyAuth(auth);
    return this.adminService.getStats();
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get platform settings' })
  getSettings(@Headers('authorization') auth: string) {
    this.verifyAuth(auth);
    return this.adminService.getSettings();
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update platform settings' })
  updateSettings(@Headers('authorization') auth: string, @Body() body: any) {
    this.verifyAuth(auth);
    return this.adminService.updateSettings(body);
  }

  @Get('audit-log')
  @ApiOperation({ summary: 'Get audit log' })
  getAuditLog(@Headers('authorization') auth: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    this.verifyAuth(auth);
    return this.adminService.getAuditLog(parseInt(page || '1'), parseInt(limit || '50'));
  }

  @Get('live-activity')
  @ApiOperation({ summary: 'Get real-time platform activity' })
  getLiveActivity(@Headers('authorization') auth: string) {
    this.verifyAuth(auth);
    return this.adminService.getLiveActivity();
  }

  @Get('match-analytics')
  @ApiOperation({ summary: 'Get match analytics' })
  getMatchAnalytics(@Headers('authorization') auth: string, @Query('period') period?: string) {
    this.verifyAuth(auth);
    return this.adminService.getMatchAnalytics(period);
  }

  @Get('revenue-deep-dive')
  @ApiOperation({ summary: 'Get detailed revenue analytics' })
  getRevenueDeepDive(@Headers('authorization') auth: string, @Query('period') period?: string) {
    this.verifyAuth(auth);
    return this.adminService.getRevenueDeepDive(period);
  }

  @Get('geo-analytics')
  @ApiOperation({ summary: 'Get geographic analytics' })
  getGeoAnalytics(@Headers('authorization') auth: string) {
    this.verifyAuth(auth);
    return this.adminService.getGeoAnalytics();
  }

  @Get('system-health')
  @ApiOperation({ summary: 'Get system health status' })
  getSystemHealth(@Headers('authorization') auth: string) {
    this.verifyAuth(auth);
    return this.adminService.getSystemHealth();
  }

  @Get('notification-history')
  @ApiOperation({ summary: 'Get notification delivery history' })
  getNotificationHistory(
    @Headers('authorization') auth: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('channel') channel?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.verifyAuth(auth);
    return this.adminService.getNotificationHistory(
      parseInt(page || '1'),
      parseInt(limit || '50'),
      { type, status, channel, startDate, endDate },
    );
  }

  @Get('notification-analytics')
  @ApiOperation({ summary: 'Get notification analytics' })
  getNotificationAnalytics(@Headers('authorization') auth: string, @Query('period') period?: string) {
    this.verifyAuth(auth);
    return this.adminService.getNotificationAnalytics(period);
  }

  @Get('notification-history/:id')
  @ApiOperation({ summary: 'Get notification detail' })
  getNotificationDetail(@Headers('authorization') auth: string, @Param('id') id: string) {
    this.verifyAuth(auth);
    return this.adminService.getNotificationDetail(id);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'Get all subscriptions' })
  getSubscriptions(
    @Headers('authorization') auth: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('planId') planId?: string,
    @Query('search') search?: string,
  ) {
    this.verifyAuth(auth);
    return this.adminService.getSubscriptions(parseInt(page || '1'), parseInt(limit || '50'), { status, planId, search });
  }

  @Get('subscriptions/analytics')
  @ApiOperation({ summary: 'Get subscription analytics' })
  getSubscriptionAnalytics(@Headers('authorization') auth: string, @Query('period') period?: string) {
    this.verifyAuth(auth);
    return this.adminService.getSubscriptionAnalytics(period);
  }

  @Get('subscriptions/plans')
  @ApiOperation({ summary: 'Get all plans' })
  getPlans(@Headers('authorization') auth: string) {
    this.verifyAuth(auth);
    return this.adminService.getAllPlans();
  }

  @Get('subscriptions/:id')
  @ApiOperation({ summary: 'Get subscription detail' })
  getSubscriptionDetail(@Headers('authorization') auth: string, @Param('id') id: string) {
    this.verifyAuth(auth);
    return this.adminService.getSubscriptionDetail(id);
  }

  @Post('subscriptions/:id/cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  cancelSubscription(@Headers('authorization') auth: string, @Param('id') id: string, @Body() body: { reason?: string }) {
    this.verifyAuth(auth);
    return this.adminService.cancelSubscription(id, body.reason);
  }

  @Post('subscriptions/:id/refund')
  @ApiOperation({ summary: 'Refund subscription' })
  refundSubscription(@Headers('authorization') auth: string, @Param('id') id: string, @Body() body: { reason?: string }) {
    this.verifyAuth(auth);
    return this.adminService.refundSubscription(id, body.reason);
  }

  @Post('subscriptions/grant')
  @ApiOperation({ summary: 'Grant premium to user' })
  grantPremium(@Headers('authorization') auth: string, @Body() body: { userId: string; planId: string; durationDays?: number }) {
    this.verifyAuth(auth);
    return this.adminService.grantPremium(body.userId, body.planId, body.durationDays);
  }
}

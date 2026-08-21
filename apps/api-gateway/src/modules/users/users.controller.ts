import { Controller, Get, Patch, Put, Post, Delete, Body, Param, Req, Res, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const USER_SERVICE = process.env.USER_SERVICE_URL;

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly http: HttpService) {}

  private authHeaders(req: Request) {
    return { authorization: req.headers.authorization };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${USER_SERVICE}/users/me`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.patch(`${USER_SERVICE}/users/me`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user account' })
  async deleteMe(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.delete(`${USER_SERVICE}/users/me`, {
        headers: this.authHeaders(req),
        data: body,
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user public profile' })
  async getUser(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${USER_SERVICE}/users/${userId}`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('me/preferences')
  @ApiOperation({ summary: 'Get user preferences' })
  async getPreferences(@Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${USER_SERVICE}/users/me/preferences`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Put('me/preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  async updatePreferences(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.put(`${USER_SERVICE}/users/me/preferences`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post(':userId/block')
  @ApiOperation({ summary: 'Block a user' })
  async blockUser(@Param('userId') userId: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${USER_SERVICE}/users/${userId}/block`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Delete(':userId/block')
  @ApiOperation({ summary: 'Unblock a user' })
  async unblockUser(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.delete(`${USER_SERVICE}/users/${userId}/block`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('me/blocks')
  @ApiOperation({ summary: 'List blocked users' })
  async listBlockedUsers(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${USER_SERVICE}/users/me/blocks`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post(':userId/report')
  @ApiOperation({ summary: 'Report a user' })
  async reportUser(@Param('userId') userId: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${USER_SERVICE}/users/${userId}/report`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('sync')
  @ApiOperation({ summary: 'Get sync delta for user profiles' })
  async getSyncDelta(@Query('since') since: string, @Req() req: Request, @Res() res: Response) {
    try {
      const result = await firstValueFrom(
        this.http.get(`${USER_SERVICE}/users/sync`, {
          params: { since },
          headers: this.authHeaders(req),
        }),
      );
      return res.status(result.status).json(result.data);
    } catch {
      return res.json({ data: null });
    }
  }
}

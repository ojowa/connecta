import { Controller, Get, Put, Post, Delete, Body, Param, Req, Res, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3002';

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

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.put(`${USER_SERVICE}/users/me`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user account' })
  async deleteMe(@Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.delete(`${USER_SERVICE}/users/me`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user public profile' })
  async getUser(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${USER_SERVICE}/users/${id}`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  async updatePreferences(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.put(`${USER_SERVICE}/users/preferences`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('block')
  @ApiOperation({ summary: 'Block a user' })
  async blockUser(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${USER_SERVICE}/users/block`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Delete('block/:userId')
  @ApiOperation({ summary: 'Unblock a user' })
  async unblockUser(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.delete(`${USER_SERVICE}/users/block/${userId}`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('report')
  @ApiOperation({ summary: 'Report a user' })
  async reportUser(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${USER_SERVICE}/users/report`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }
}

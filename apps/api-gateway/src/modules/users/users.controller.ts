import { Controller, Get, Patch, Put, Post, Delete, Body, Param, Req, Res, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { proxyGet, proxyPost, proxyPut, proxyPatch, proxyDelete, handleError } from '../../helpers/proxy.helper';
import { firstValueFrom } from 'rxjs';

const USER_SERVICE = process.env.USER_SERVICE_URL;

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly http: HttpService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${USER_SERVICE}/users/me`, req, res);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPatch(this.http, `${USER_SERVICE}/users/me`, body, req, res);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user account' })
  async deleteMe(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    try {
      const result = await firstValueFrom(
        this.http.delete(`${USER_SERVICE}/users/me`, {
          headers: { authorization: req.headers.authorization },
          data: body,
        }),
      );
      return res.status(result.status).json(result.data);
    } catch (err) {
      return handleError(err, `${USER_SERVICE}/users/me`, res);
    }
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user public profile' })
  async getUser(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${USER_SERVICE}/users/${userId}`, req, res);
  }

  @Get('me/preferences')
  @ApiOperation({ summary: 'Get user preferences' })
  async getPreferences(@Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${USER_SERVICE}/users/me/preferences`, req, res);
  }

  @Put('me/preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  async updatePreferences(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPut(this.http, `${USER_SERVICE}/users/me/preferences`, body, req, res);
  }

  @Post(':userId/block')
  @ApiOperation({ summary: 'Block a user' })
  async blockUser(@Param('userId') userId: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${USER_SERVICE}/users/${userId}/block`, body, req, res);
  }

  @Delete(':userId/block')
  @ApiOperation({ summary: 'Unblock a user' })
  async unblockUser(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    return proxyDelete(this.http, `${USER_SERVICE}/users/${userId}/block`, req, res);
  }

  @Get('me/blocks')
  @ApiOperation({ summary: 'List blocked users' })
  async listBlockedUsers(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${USER_SERVICE}/users/me/blocks`, req, res);
  }

  @Post(':userId/report')
  @ApiOperation({ summary: 'Report a user' })
  async reportUser(@Param('userId') userId: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${USER_SERVICE}/users/${userId}/report`, body, req, res);
  }

  @Get('sync')
  @ApiOperation({ summary: 'Get sync delta for user profiles' })
  async getSyncDelta(@Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${USER_SERVICE}/users/sync`, req, res);
  }
}

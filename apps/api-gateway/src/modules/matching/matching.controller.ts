import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const MATCHING_SERVICE = process.env.MATCHING_SERVICE_URL || 'http://localhost:3004';

@ApiTags('Matching')
@ApiBearerAuth()
@Controller('match')
export class MatchingController {
  constructor(private readonly http: HttpService) {}

  private authHeaders(req: Request) {
    return { authorization: req.headers.authorization };
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get discovery feed' })
  async getFeed(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${MATCHING_SERVICE}/match/feed`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('like')
  @ApiOperation({ summary: 'Like a user' })
  async likeUser(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${MATCHING_SERVICE}/match/like`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('pass')
  @ApiOperation({ summary: 'Pass on a user' })
  async passUser(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${MATCHING_SERVICE}/match/pass`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('super-like')
  @ApiOperation({ summary: 'Super like a user' })
  async superLikeUser(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${MATCHING_SERVICE}/match/super-like`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Delete('undo')
  @ApiOperation({ summary: 'Undo last swipe' })
  async undoSwipe(@Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.delete(`${MATCHING_SERVICE}/match/undo`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('matches')
  @ApiOperation({ summary: 'Get list of matches' })
  async getMatches(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${MATCHING_SERVICE}/match/matches`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('liked-you')
  @ApiOperation({ summary: 'Get users who liked you (premium)' })
  async getLikedYou(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${MATCHING_SERVICE}/match/liked-you`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('compatibility/:userId')
  @ApiOperation({ summary: 'Get compatibility score with a user' })
  async getCompatibility(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${MATCHING_SERVICE}/match/compatibility/${userId}`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update matching preferences' })
  async updatePreferences(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.put(`${MATCHING_SERVICE}/match/preferences`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }
}

import { Controller, Get, Post, Delete, Body, Param, Query, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const MATCHING_SERVICE = process.env.MATCHING_SERVICE_URL;

@ApiTags('Matching')
@ApiBearerAuth()
@Controller('matching')
export class MatchingController {
  constructor(private readonly http: HttpService) {}

  private authHeaders(req: Request) {
    return { authorization: req.headers.authorization };
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get discovery feed' })
  async getFeed(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${MATCHING_SERVICE}/matching/feed`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('like/:userId')
  @ApiOperation({ summary: 'Like a user' })
  async likeUser(@Param('userId') userId: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${MATCHING_SERVICE}/matching/like/${userId}`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('pass/:userId')
  @ApiOperation({ summary: 'Pass on a user' })
  async passUser(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${MATCHING_SERVICE}/matching/pass/${userId}`, null, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('superlike/:userId')
  @ApiOperation({ summary: 'Super like a user' })
  async superLikeUser(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${MATCHING_SERVICE}/matching/superlike/${userId}`, null, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('undo')
  @ApiOperation({ summary: 'Undo last swipe' })
  async undoSwipe(@Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${MATCHING_SERVICE}/matching/undo`, null, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('matches')
  @ApiOperation({ summary: 'Get list of matches' })
  async getMatches(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${MATCHING_SERVICE}/matching/matches`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Delete('matches/:matchId')
  @ApiOperation({ summary: 'Unmatch a user' })
  async unmatch(@Param('matchId') matchId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.delete(`${MATCHING_SERVICE}/matching/matches/${matchId}`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('liked-you')
  @ApiOperation({ summary: 'Get users who liked you (premium)' })
  async getLikedYou(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${MATCHING_SERVICE}/matching/liked-you`, {
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
      this.http.get(`${MATCHING_SERVICE}/matching/compatibility/${userId}`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('scam-check/:userId')
  @ApiOperation({ summary: 'Check scam risk for a conversation' })
  async checkScamRisk(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${MATCHING_SERVICE}/matching/scam-check/${userId}`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('safety-score/:userId')
  @ApiOperation({ summary: 'Get behavioral safety score for a user' })
  async getSafetyScore(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${MATCHING_SERVICE}/matching/safety-score/${userId}`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('sync')
  @ApiOperation({ summary: 'Get sync delta for matches' })
  async getSyncDelta(@Query('since') since: string, @Req() req: Request, @Res() res: Response) {
    try {
      const result = await firstValueFrom(
        this.http.get(`${MATCHING_SERVICE}/matching/sync`, {
          params: { since },
          headers: this.authHeaders(req),
        }),
      );
      return res.status(result.status).json(result.data);
    } catch {
      return res.json({ data: [] });
    }
  }
}

import { Controller, Get, Post, Delete, Body, Param, Query, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { proxyGet, proxyPost, proxyDelete } from '../../helpers/proxy.helper';

const MATCHING_SERVICE = process.env.MATCHING_SERVICE_URL;

@ApiTags('Matching')
@ApiBearerAuth()
@Controller('matching')
export class MatchingController {
  constructor(private readonly http: HttpService) {}

  @Get('feed')
  @ApiOperation({ summary: 'Get discovery feed' })
  async getFeed(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${MATCHING_SERVICE}/matching/feed`, req, res);
  }

  @Post('like/:userId')
  @ApiOperation({ summary: 'Like a user' })
  async likeUser(@Param('userId') userId: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${MATCHING_SERVICE}/matching/like/${userId}`, body, req, res);
  }

  @Post('pass/:userId')
  @ApiOperation({ summary: 'Pass on a user' })
  async passUser(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${MATCHING_SERVICE}/matching/pass/${userId}`, null, req, res);
  }

  @Post('superlike/:userId')
  @ApiOperation({ summary: 'Super like a user' })
  async superLikeUser(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${MATCHING_SERVICE}/matching/superlike/${userId}`, null, req, res);
  }

  @Post('undo')
  @ApiOperation({ summary: 'Undo last swipe' })
  async undoSwipe(@Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${MATCHING_SERVICE}/matching/undo`, null, req, res);
  }

  @Get('matches')
  @ApiOperation({ summary: 'Get list of matches' })
  async getMatches(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${MATCHING_SERVICE}/matching/matches`, req, res);
  }

  @Delete('matches/:matchId')
  @ApiOperation({ summary: 'Unmatch a user' })
  async unmatch(@Param('matchId') matchId: string, @Req() req: Request, @Res() res: Response) {
    return proxyDelete(this.http, `${MATCHING_SERVICE}/matching/matches/${matchId}`, req, res);
  }

  @Get('liked-you')
  @ApiOperation({ summary: 'Get users who liked you (premium)' })
  async getLikedYou(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${MATCHING_SERVICE}/matching/liked-you`, req, res);
  }

  @Get('compatibility/:userId')
  @ApiOperation({ summary: 'Get compatibility score with a user' })
  async getCompatibility(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${MATCHING_SERVICE}/matching/compatibility/${userId}`, req, res);
  }

  @Get('scam-check/:userId')
  @ApiOperation({ summary: 'Check scam risk for a conversation' })
  async checkScamRisk(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${MATCHING_SERVICE}/matching/scam-check/${userId}`, req, res);
  }

  @Get('safety-score/:userId')
  @ApiOperation({ summary: 'Get behavioral safety score for a user' })
  async getSafetyScore(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${MATCHING_SERVICE}/matching/safety-score/${userId}`, req, res);
  }

  @Get('sync')
  @ApiOperation({ summary: 'Get sync delta for matches' })
  async getSyncDelta(@Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${MATCHING_SERVICE}/matching/sync`, req, res);
  }
}

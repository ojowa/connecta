import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MatchingService } from './matching.service';

@ApiTags('Matching') @ApiBearerAuth() @Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('feed') @ApiOperation({ summary: 'Get discovery feed with AI-powered scoring' })
  getFeed(@Body('_userId') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) { return this.matchingService.getFeed(userId, page, limit); }

  @Post('like/:userId') @ApiOperation({ summary: 'Like a user' })
  like(@Body('_userId') userId: string, @Param('userId') targetUserId: string, @Body('likeType') likeType?: string) { return this.matchingService.like(userId, targetUserId, likeType); }

  @Post('pass/:userId') @ApiOperation({ summary: 'Pass on a user' })
  pass(@Body('_userId') userId: string, @Param('userId') targetUserId: string) { return this.matchingService.pass(userId, targetUserId); }

  @Post('superlike/:userId') @ApiOperation({ summary: 'Super like a user' })
  superLike(@Body('_userId') userId: string, @Param('userId') targetUserId: string) { return this.matchingService.superLike(userId, targetUserId); }

  @Post('undo') @ApiOperation({ summary: 'Undo last swipe' })
  undo(@Body('_userId') userId: string) { return this.matchingService.undo(userId); }

  @Get('matches') @ApiOperation({ summary: 'Get matches' })
  getMatches(@Body('_userId') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) { return this.matchingService.getMatches(userId, page, limit); }

  @Delete('matches/:matchId') @ApiOperation({ summary: 'Unmatch' })
  unmatch(@Body('_userId') userId: string, @Param('matchId') matchId: string) { return this.matchingService.unmatch(userId, matchId); }

  @Get('liked-you') @ApiOperation({ summary: 'Get users who liked you' })
  getLikedYou(@Body('_userId') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) { return this.matchingService.getLikedYou(userId, page, limit); }

  @Get('compatibility/:userId') @ApiOperation({ summary: 'Get AI-powered compatibility score' })
  getCompatibility(@Body('_userId') userId: string, @Param('userId') targetUserId: string) { return this.matchingService.getCompatibility(userId, targetUserId); }

  @Get('scam-check/:userId') @ApiOperation({ summary: 'Check scam risk for a conversation' })
  checkScamRisk(@Body('_userId') userId: string, @Param('userId') targetUserId: string) { return this.matchingService.checkScamRisk(userId, targetUserId); }

  @Get('safety-score/:userId') @ApiOperation({ summary: 'Get behavioral safety score for a user' })
  getSafetyScore(@Body('_userId') userId: string, @Param('userId') targetUserId: string) { return this.matchingService.getBehavioralAnalysis(targetUserId); }
}

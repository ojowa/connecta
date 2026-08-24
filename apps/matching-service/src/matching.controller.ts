import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MatchingService } from './matching.service';

@ApiTags('Matching')
@ApiBearerAuth()
@Controller()
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('feed')
  @ApiOperation({ summary: 'Get discovery feed' })
  getFeed(@Body('_userId') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.matchingService.getFeed(userId, page, limit);
  }

  @Post('like/:userId')
  @ApiOperation({ summary: 'Like a user' })
  like(@Body('_userId') currentUserId: string, @Param('userId') targetUserId: string) {
    return this.matchingService.like(currentUserId, targetUserId);
  }

  @Post('pass/:userId')
  @ApiOperation({ summary: 'Pass on a user' })
  pass(@Body('_userId') currentUserId: string, @Param('userId') targetUserId: string) {
    return this.matchingService.pass(currentUserId, targetUserId);
  }

  @Post('superlike/:userId')
  @ApiOperation({ summary: 'Super like a user' })
  superlike(@Body('_userId') currentUserId: string, @Param('userId') targetUserId: string) {
    return this.matchingService.superlike(currentUserId, targetUserId);
  }

  @Post('undo')
  @ApiOperation({ summary: 'Undo last action' })
  undo(@Body('_userId') userId: string) {
    return this.matchingService.undo(userId);
  }

  @Get('matches')
  @ApiOperation({ summary: 'Get matches' })
  getMatches(@Body('_userId') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.matchingService.getMatches(userId, page, limit);
  }

  @Delete('matches/:matchId')
  @ApiOperation({ summary: 'Unmatch' })
  unmatch(@Body('_userId') userId: string, @Param('matchId') matchId: string) {
    return this.matchingService.unmatch(userId, matchId);
  }

  @Get('liked-you')
  @ApiOperation({ summary: 'Get users who liked you' })
  getLikedYou(@Body('_userId') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.matchingService.getLikedYou(userId, page, limit);
  }

  @Get('compatibility/:userId')
  @ApiOperation({ summary: 'Get compatibility score' })
  getCompatibility(@Body('_userId') userId: string, @Param('userId') targetUserId: string) {
    return this.matchingService.getCompatibility(userId, targetUserId);
  }

  @Get('sync')
  @ApiOperation({ summary: 'Sync matching data' })
  getSync(@Body('_userId') userId: string, @Query('since') since?: string) {
    return this.matchingService.getSync(userId, since ? parseInt(since, 10) : 0);
  }
}

import { Controller, Get, Post, Delete, Body, Param, Query, Headers, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { MatchingEnhancementService } from './matching-enhancement.service';

@ApiTags('Matching')
@ApiBearerAuth()
@Controller()
export class MatchingController {
  constructor(
    private readonly matchingService: MatchingService,
    private readonly enhancementService: MatchingEnhancementService,
  ) {}

  @Get('plan-info')
  @ApiOperation({ summary: 'Get user plan info and daily usage' })
  getPlanInfo(@Headers('x-user-id') userId: string) {
    return this.matchingService.getUserPlanInfo(userId);
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get discovery feed' })
  getFeed(@Headers('x-user-id') userId: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.matchingService.getFeed(userId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
  }

  @Post('like/:userId')
  @ApiOperation({ summary: 'Like a user' })
  like(@Headers('x-user-id') currentUserId: string, @Param('userId') targetUserId: string) {
    return this.matchingService.like(currentUserId, targetUserId);
  }

  @Post('pass/:userId')
  @ApiOperation({ summary: 'Pass on a user' })
  pass(@Headers('x-user-id') currentUserId: string, @Param('userId') targetUserId: string) {
    return this.matchingService.pass(currentUserId, targetUserId);
  }

  @Post('superlike/:userId')
  @ApiOperation({ summary: 'Super like a user' })
  superlike(@Headers('x-user-id') currentUserId: string, @Param('userId') targetUserId: string) {
    return this.matchingService.superlike(currentUserId, targetUserId);
  }

  @Post('undo')
  @ApiOperation({ summary: 'Undo last action' })
  undo(@Headers('x-user-id') userId: string) {
    return this.matchingService.undo(userId);
  }

  @Post('rewind')
  @ApiOperation({ summary: 'Rewind last 5 actions' })
  rewind(@Headers('x-user-id') userId: string) {
    return this.matchingService.rewind(userId);
  }

  @Post('boost')
  @ApiOperation({ summary: 'Activate boost' })
  activateBoost(@Headers('x-user-id') userId: string) {
    return this.matchingService.activateBoost(userId);
  }

  @Get('boost')
  @ApiOperation({ summary: 'Get boost status' })
  getBoostStatus(@Headers('x-user-id') userId: string) {
    return this.matchingService.getBoostStatus(userId);
  }

  @Post('incognito/toggle')
  @ApiOperation({ summary: 'Toggle incognito mode' })
  toggleIncognito(@Headers('x-user-id') userId: string) {
    return this.matchingService.toggleIncognito(userId);
  }

  @Post('passport')
  @ApiOperation({ summary: 'Update passport location' })
  updatePassport(@Headers('x-user-id') userId: string, @Body() body: { latitude: number; longitude: number; enabled: boolean }) {
    return this.matchingService.updatePassport(userId, body.latitude, body.longitude, body.enabled);
  }

  @Post('photos/:photoId/like')
  @ApiOperation({ summary: 'Like a photo' })
  likePhoto(@Headers('x-user-id') userId: string, @Param('photoId') photoId: string, @Body() body: { profileId: string }) {
    return this.matchingService.likePhoto(userId, photoId, body.profileId);
  }

  @Get('photos/stats')
  @ApiOperation({ summary: 'Get photo like stats' })
  getPhotoStats(@Headers('x-user-id') userId: string) {
    return this.matchingService.getPhotoStats(userId);
  }

  @Get('matches')
  @ApiOperation({ summary: 'Get matches' })
  getMatches(@Headers('x-user-id') userId: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.matchingService.getMatches(userId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
  }

  @Delete('matches/:matchId')
  @ApiOperation({ summary: 'Unmatch' })
  unmatch(@Headers('x-user-id') userId: string, @Param('matchId') matchId: string) {
    return this.matchingService.unmatch(userId, matchId);
  }

  @Get('liked-you')
  @ApiOperation({ summary: 'Get users who liked you' })
  getLikedYou(@Headers('x-user-id') userId: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.matchingService.getLikedYou(userId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
  }

  @Get('my-likes')
  @ApiOperation({ summary: 'Get users you liked who haven\'t liked you back' })
  getMyLikes(@Headers('x-user-id') userId: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.matchingService.getMyLikes(userId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
  }

  @Post('profile-view/:profileId')
  @ApiOperation({ summary: 'Record a profile view' })
  recordProfileView(@Headers('x-user-id') viewerId: string, @Param('profileId') profileId: string) {
    return this.matchingService.recordProfileView(viewerId, profileId);
  }

  @Get('profile-viewers')
  @ApiOperation({ summary: 'Get users who viewed your profile' })
  getProfileViewers(
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('filter') filter?: string,
  ) {
    return this.matchingService.getProfileViewers(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      filter as 'all' | 'discovery' | 'matched' | undefined,
    );
  }

  @Get('compatibility/:userId')
  @ApiOperation({ summary: 'Get compatibility score' })
  getCompatibility(@Headers('x-user-id') userId: string, @Param('userId') targetUserId: string) {
    return this.matchingService.getCompatibility(userId, targetUserId);
  }

  @Get('sync')
  @ApiOperation({ summary: 'Sync matching data' })
  getSync(@Headers('x-user-id') userId: string, @Query('since') since?: string) {
    return this.matchingService.getSync(userId, since ? parseInt(since, 10) : 0);
  }

  @Post('moments')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a moment' })
  createMoment(
    @Headers('x-user-id') userId: string,
    @Body() body: { mediaUrl?: string; caption?: string; mediaType?: string },
  ) {
    return this.matchingService.createMoment(userId, body.mediaUrl || '', body.caption, body.mediaType);
  }

  @Get('moments/mine')
  @ApiOperation({ summary: 'Get own moments' })
  getMyMoments(
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.matchingService.getMyMoments(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
  }

  @Get('moments')
  @ApiOperation({ summary: 'Get moments feed from matches' })
  getMoments(
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.matchingService.getMoments(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
  }

  @Post('moments/:id/view')
  @ApiOperation({ summary: 'Mark a moment as viewed' })
  viewMoment(@Headers('x-user-id') userId: string, @Param('id') momentId: string) {
    return this.matchingService.viewMoment(userId, momentId);
  }

  @Delete('moments/:id')
  @ApiOperation({ summary: 'Delete own moment' })
  deleteMoment(@Headers('x-user-id') userId: string, @Param('id') momentId: string) {
    return this.matchingService.deleteMoment(userId, momentId);
  }

  @Post('moments/cleanup')
  @ApiOperation({ summary: 'Delete expired moments (admin/cron)' })
  cleanupMoments(@Headers('x-user-id') userId: string) {
    return this.matchingService.cleanupExpiredMoments();
  }

  @Get('scam-check/:userId')
  @ApiOperation({ summary: 'Check scam risk for a conversation' })
  checkScamRisk(@Headers('x-user-id') userId: string, @Param('userId') targetUserId: string) {
    return this.matchingService.checkScamRisk(userId, targetUserId);
  }

  @Get('icebreakers/:userId')
  @ApiOperation({ summary: 'Get AI-generated icebreakers for a match' })
  getIcebreakers(@Headers('x-user-id') userId: string, @Param('userId') targetUserId: string) {
    return this.matchingService.getIcebreakers(userId, targetUserId);
  }

  @Post('toxicity-check')
  @ApiOperation({ summary: 'Check text for toxic content' })
  checkToxicity(@Body() body: { text: string }) {
    return this.matchingService.checkToxicity(body.text);
  }

  @Get('fake-profile-check/:userId')
  @ApiOperation({ summary: 'Analyze a profile for fake/suspicious signals' })
  checkFakeProfile(@Param('userId') userId: string) {
    return this.matchingService.checkFakeProfile(userId);
  }

  @Get('preference-model')
  @ApiOperation({ summary: 'Get your behavioral preference model' })
  getPreferenceModel(@Headers('x-user-id') userId: string) {
    return this.enhancementService.getUserPreferenceModel(userId);
  }

  @Get('elo-score')
  @ApiOperation({ summary: 'Get your Elo score' })
  getEloScore(@Headers('x-user-id') userId: string) {
    return this.enhancementService.calculateEloScore(userId);
  }
}

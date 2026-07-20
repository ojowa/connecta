import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Matching')
@ApiBearerAuth()
@Controller('match')
export class MatchingController {
  @Get('feed')
  @ApiOperation({ summary: 'Get discovery feed' })
  getFeed(@Query() query: any) {
    return { message: 'Get feed endpoint — to be implemented' };
  }

  @Post('like')
  @ApiOperation({ summary: 'Like a user' })
  likeUser(@Body() body: any) {
    return { message: 'Like user endpoint — to be implemented' };
  }

  @Post('pass')
  @ApiOperation({ summary: 'Pass on a user' })
  passUser(@Body() body: any) {
    return { message: 'Pass user endpoint — to be implemented' };
  }

  @Post('super-like')
  @ApiOperation({ summary: 'Super like a user' })
  superLikeUser(@Body() body: any) {
    return { message: 'Super like endpoint — to be implemented' };
  }

  @Delete('undo')
  @ApiOperation({ summary: 'Undo last swipe' })
  undoSwipe() {
    return { message: 'Undo swipe endpoint — to be implemented' };
  }

  @Get('matches')
  @ApiOperation({ summary: 'Get list of matches' })
  getMatches(@Query() query: any) {
    return { message: 'Get matches endpoint — to be implemented' };
  }

  @Get('liked-you')
  @ApiOperation({ summary: 'Get users who liked you (premium)' })
  getLikedYou(@Query() query: any) {
    return { message: 'Liked you endpoint — to be implemented' };
  }

  @Get('compatibility/:userId')
  @ApiOperation({ summary: 'Get compatibility score with a user' })
  getCompatibility(@Param('userId') userId: string) {
    return { message: `Compatibility score for ${userId} — to be implemented` };
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update matching preferences' })
  updatePreferences(@Body() body: any) {
    return { message: 'Update matching preferences — to be implemented' };
  }
}

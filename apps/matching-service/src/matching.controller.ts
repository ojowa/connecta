import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MatchingService } from './matching.service';

@ApiTags('Matching')
@Controller('match')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('feed')
  @ApiOperation({ summary: 'Get discovery feed' })
  getFeed(@Query() query: any) {
    return this.matchingService.getFeed(query);
  }

  @Post('like')
  @ApiOperation({ summary: 'Like a user' })
  like(@Body() body: any) {
    return this.matchingService.like(body);
  }

  @Post('pass')
  @ApiOperation({ summary: 'Pass on a user' })
  pass(@Body() body: any) {
    return this.matchingService.pass(body);
  }

  @Post('super-like')
  @ApiOperation({ summary: 'Super like a user' })
  superLike(@Body() body: any) {
    return this.matchingService.superLike(body);
  }

  @Delete('undo')
  @ApiOperation({ summary: 'Undo last swipe' })
  undo() {
    return this.matchingService.undo();
  }

  @Get('matches')
  @ApiOperation({ summary: 'Get matches' })
  getMatches(@Query() query: any) {
    return this.matchingService.getMatches(query);
  }
}

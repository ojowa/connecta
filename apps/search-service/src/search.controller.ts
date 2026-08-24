import { Controller, Get, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@ApiBearerAuth()
@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('users')
  @ApiOperation({ summary: 'Search users' })
  search(@Body('_userId') userId: string, @Query('q') query: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.searchService.searchUsers(userId, query, page, limit);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete' })
  autocomplete(@Body('_userId') userId: string, @Query('q') query: string) {
    return this.searchService.autocomplete(userId, query);
  }
}

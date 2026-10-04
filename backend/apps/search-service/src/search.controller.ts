import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@ApiBearerAuth()
@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('users')
  @ApiOperation({ summary: 'Search users' })
  search(@Headers('x-user-id') userId: string, @Query('q') query: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.searchService.searchUsers(userId, query, page, limit);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete' })
  autocomplete(@Headers('x-user-id') userId: string, @Query('q') query: string) {
    return this.searchService.autocomplete(userId, query);
  }
}

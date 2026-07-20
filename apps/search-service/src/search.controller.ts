import { Controller, Get, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { UserSearchQueryDto, AutocompleteQueryDto } from './dto';

@ApiTags('Search') @ApiBearerAuth() @Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('users') @ApiOperation({ summary: 'Search users' })
  search(@Body('_userId') userId: string, @Query() query: UserSearchQueryDto) { return this.searchService.searchUsers(userId, query); }

  @Get('autocomplete') @ApiOperation({ summary: 'Autocomplete' })
  autocomplete(@Body('_userId') userId: string, @Query() query: AutocompleteQueryDto) { return this.searchService.autocomplete(userId, query.q); }
}

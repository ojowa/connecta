import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('users')
  @ApiOperation({ summary: 'Search users' })
  searchUsers(@Query() query: any) {
    return this.searchService.searchUsers(query);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete' })
  autocomplete(@Query() query: any) {
    return this.searchService.autocomplete(query);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  @Get('users')
  @ApiOperation({ summary: 'Search users' })
  searchUsers(@Query() query: any) {
    return { message: 'Search users endpoint — to be implemented' };
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete search' })
  autocomplete(@Query() query: any) {
    return { message: 'Autocomplete endpoint — to be implemented' };
  }
}

import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { proxyGet } from '../../helpers/proxy.helper';

const SEARCH_SERVICE = process.env.SEARCH_SERVICE_URL;

@ApiTags('Search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(private readonly http: HttpService) {}

  @Get('users')
  @ApiOperation({ summary: 'Search users' })
  async searchUsers(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${SEARCH_SERVICE}/search/users`, req, res);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete search' })
  async autocomplete(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${SEARCH_SERVICE}/search/autocomplete`, req, res);
  }
}

import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';

@ApiTags('Sync')
@Controller('sync')
export class SyncController {
  @Get('vector-clock')
  @ApiOperation({ summary: 'Get server vector clock for offline sync' })
  async getVectorClock(@Req() req: Request, @Res() res: Response) {
    const userId = (req as any).user?.id;
    return res.json({
      data: { vectorClock: JSON.stringify([[userId || 'server', Date.now()]]) },
    });
  }
}

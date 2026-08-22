import { Controller, Get, Post, Body, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { proxyGet, proxyPost } from '../../helpers/proxy.helper';

const CALL_SERVICE = process.env.CALL_SERVICE_URL;

@ApiTags('Calls')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calls')
export class CallsController {
  constructor(private readonly http: HttpService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a call' })
  async startCall(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return proxyPost(this.http, `${CALL_SERVICE}/calls/start`, body, req, res);
  }

  @Post(':callId/answer')
  @ApiOperation({ summary: 'Answer a call' })
  async answerCall(
    @Param('callId') callId: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return proxyPost(this.http, `${CALL_SERVICE}/calls/${callId}/answer`, body, req, res);
  }

  @Post(':callId/reject')
  @ApiOperation({ summary: 'Reject a call' })
  async rejectCall(
    @Param('callId') callId: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return proxyPost(this.http, `${CALL_SERVICE}/calls/${callId}/reject`, body, req, res);
  }

  @Post(':callId/end')
  @ApiOperation({ summary: 'End a call' })
  async endCall(
    @Param('callId') callId: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return proxyPost(this.http, `${CALL_SERVICE}/calls/${callId}/end`, body, req, res);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get call history' })
  async getCallHistory(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${CALL_SERVICE}/calls/history`, req, res);
  }
}

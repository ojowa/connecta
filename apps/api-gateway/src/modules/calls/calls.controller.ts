import { Controller, Get, Post, Body, Param, Query, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const CALL_SERVICE = process.env.CALL_SERVICE_URL || 'http://localhost:3006';

@ApiTags('Calls')
@ApiBearerAuth()
@Controller('calls')
export class CallsController {
  constructor(private readonly http: HttpService) {}

  private authHeaders(req: Request) {
    return { authorization: req.headers.authorization };
  }

  @Post('start')
  @ApiOperation({ summary: 'Start a call' })
  async startCall(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${CALL_SERVICE}/calls/start`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('answer')
  @ApiOperation({ summary: 'Answer a call' })
  async answerCall(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${CALL_SERVICE}/calls/answer`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('reject')
  @ApiOperation({ summary: 'Reject a call' })
  async rejectCall(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${CALL_SERVICE}/calls/reject`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('end')
  @ApiOperation({ summary: 'End a call' })
  async endCall(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${CALL_SERVICE}/calls/end`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get call history' })
  async getCallHistory(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${CALL_SERVICE}/calls/history`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('ice-candidate')
  @ApiOperation({ summary: 'Exchange ICE candidates' })
  async exchangeIceCandidate(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${CALL_SERVICE}/calls/ice-candidate`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }
}

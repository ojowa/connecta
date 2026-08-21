import { Controller, Get, Post, Body, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';

const CALL_SERVICE = process.env.CALL_SERVICE_URL;

@ApiTags('Calls')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
      this.http.post(`${CALL_SERVICE}/v1/calls/start`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post(':callId/answer')
  @ApiOperation({ summary: 'Answer a call' })
  async answerCall(@Param('callId') callId: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${CALL_SERVICE}/v1/calls/${callId}/answer`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post(':callId/reject')
  @ApiOperation({ summary: 'Reject a call' })
  async rejectCall(@Param('callId') callId: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${CALL_SERVICE}/v1/calls/${callId}/reject`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post(':callId/end')
  @ApiOperation({ summary: 'End a call' })
  async endCall(@Param('callId') callId: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${CALL_SERVICE}/v1/calls/${callId}/end`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get call history' })
  async getCallHistory(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${CALL_SERVICE}/v1/calls/history`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }
}

import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CallsService } from './calls.service';

@ApiTags('Calls') @ApiBearerAuth() @Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post('start') @ApiOperation({ summary: 'Start call' })
  start(@Body() body: any) { return this.callsService.startCall(body); }

  @Post(':callId/answer') @ApiOperation({ summary: 'Answer call' })
  answer(@Param('callId') callId: string, @Body('_userId') userId: string) { return this.callsService.answerCall(callId, userId); }

  @Post(':callId/reject') @ApiOperation({ summary: 'Reject call' })
  reject(@Param('callId') callId: string, @Body('_userId') userId: string, @Body('reason') reason?: string) { return this.callsService.rejectCall(callId, userId, reason); }

  @Post(':callId/end') @ApiOperation({ summary: 'End call' })
  end(@Param('callId') callId: string, @Body('_userId') userId: string, @Body('reason') reason?: string) { return this.callsService.endCall(callId, userId, reason); }

  @Get('history') @ApiOperation({ summary: 'Call history' })
  history(@Body('_userId') userId: string, @Query('page') page?: number, @Query('limit') limit?: number, @Query('call_type') callType?: string, @Query('direction') direction?: string) {
    return this.callsService.getHistory(userId, page, limit, callType, direction);
  }
}

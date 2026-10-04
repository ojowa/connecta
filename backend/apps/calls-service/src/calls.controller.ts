import { Controller, Get, Post, Body, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CallsService } from './calls.service';

@ApiTags('Calls')
@ApiBearerAuth()
@Controller()
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start call' })
  start(@Headers('x-user-id') userId: string, @Body() body: any) {
    return this.callsService.startCall(userId, body);
  }

  @Post(':callId/answer')
  @ApiOperation({ summary: 'Answer call' })
  answer(@Headers('x-user-id') userId: string, @Param('callId') callId: string) {
    return this.callsService.answerCall(callId, userId);
  }

  @Post(':callId/reject')
  @ApiOperation({ summary: 'Reject call' })
  reject(@Headers('x-user-id') userId: string, @Param('callId') callId: string, @Body() body: any) {
    return this.callsService.rejectCall(callId, userId, body.reason);
  }

  @Post(':callId/end')
  @ApiOperation({ summary: 'End call' })
  end(@Headers('x-user-id') userId: string, @Param('callId') callId: string, @Body() body: any) {
    return this.callsService.endCall(callId, userId, body.reason);
  }

  @Get('pair')
  @ApiOperation({ summary: 'Call history between two users' })
  pairHistory(@Headers('x-user-id') userId: string, @Query('otherUserId') otherUserId: string) {
    return this.callsService.getPairHistory(userId, otherUserId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Call history' })
  history(@Headers('x-user-id') userId: string, @Query('page') page?: string, @Query('limit') limit?: string, @Query('call_type') callType?: string, @Query('direction') direction?: string) {
    return this.callsService.getHistory(userId, parseInt(page || '1'), parseInt(limit || '20'), callType, direction);
  }
}

import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CallsService } from './calls.service';

@ApiTags('Calls')
@ApiBearerAuth()
@Controller()
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start call' })
  start(@Body('_userId') userId: string, @Body() body: any) {
    return this.callsService.startCall(userId, body);
  }

  @Post(':callId/answer')
  @ApiOperation({ summary: 'Answer call' })
  answer(@Body('_userId') userId: string, @Param('callId') callId: string) {
    return this.callsService.answerCall(callId, userId);
  }

  @Post(':callId/reject')
  @ApiOperation({ summary: 'Reject call' })
  reject(@Body('_userId') userId: string, @Param('callId') callId: string, @Body() body: any) {
    return this.callsService.rejectCall(callId, userId, body.reason);
  }

  @Post(':callId/end')
  @ApiOperation({ summary: 'End call' })
  end(@Body('_userId') userId: string, @Param('callId') callId: string, @Body() body: any) {
    return this.callsService.endCall(callId, userId, body.reason);
  }

  @Get('history')
  @ApiOperation({ summary: 'Call history' })
  history(@Body('_userId') userId: string, @Query('page') page?: number, @Query('limit') limit?: number, @Query('call_type') callType?: string, @Query('direction') direction?: string) {
    return this.callsService.getHistory(userId, page, limit, callType, direction);
  }
}

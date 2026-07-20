import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CallsService } from './calls.service';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { CurrentUser } from '@app/common/decorators';

@ApiTags('Calls')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start call' })
  start(
    @Body('recipientId') recipientId: string,
    @Body('callType') callType: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.callsService.startCall({ callerId: userId, recipientId, callType });
  }

  @Post(':callId/answer')
  @ApiOperation({ summary: 'Answer call' })
  answer(
    @Param('callId') callId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.callsService.answerCall(callId, userId);
  }

  @Post(':callId/reject')
  @ApiOperation({ summary: 'Reject call' })
  reject(
    @Param('callId') callId: string,
    @CurrentUser('id') userId: string,
    @Body('reason') reason?: string,
  ) {
    return this.callsService.rejectCall(callId, userId, reason);
  }

  @Post(':callId/end')
  @ApiOperation({ summary: 'End call' })
  end(
    @Param('callId') callId: string,
    @CurrentUser('id') userId: string,
    @Body('reason') reason?: string,
  ) {
    return this.callsService.endCall(callId, userId, reason);
  }

  @Get('history')
  @ApiOperation({ summary: 'Call history' })
  history(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('call_type') callType?: string,
    @Query('direction') direction?: string,
  ) {
    return this.callsService.getHistory(userId, page, limit, callType, direction);
  }
}

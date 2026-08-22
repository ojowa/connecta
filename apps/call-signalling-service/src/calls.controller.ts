import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CallsService } from './calls.service';
import { StartCallDto, RejectCallDto, EndCallDto, CallHistoryQueryDto } from './dto';
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
  start(@Body() body: StartCallDto, @CurrentUser('id') userId: string) {
    return this.callsService.startCall({
      callerId: userId,
      recipientId: body.recipientId,
      callType: body.callType,
    });
  }

  @Post(':callId/answer')
  @ApiOperation({ summary: 'Answer call' })
  answer(@Param('callId') callId: string, @CurrentUser('id') userId: string) {
    return this.callsService.answerCall(callId, userId);
  }

  @Post(':callId/reject')
  @ApiOperation({ summary: 'Reject call' })
  reject(
    @Param('callId') callId: string,
    @CurrentUser('id') userId: string,
    @Body() body: RejectCallDto,
  ) {
    return this.callsService.rejectCall(callId, userId, body.reason);
  }

  @Post(':callId/end')
  @ApiOperation({ summary: 'End call' })
  end(
    @Param('callId') callId: string,
    @CurrentUser('id') userId: string,
    @Body() body: EndCallDto,
  ) {
    return this.callsService.endCall(callId, userId, body.reason);
  }

  @Get('history')
  @ApiOperation({ summary: 'Call history' })
  history(@CurrentUser('id') userId: string, @Query() query: CallHistoryQueryDto) {
    return this.callsService.getHistory(
      userId,
      query.page,
      query.limit,
      query.call_type,
      query.direction,
    );
  }
}

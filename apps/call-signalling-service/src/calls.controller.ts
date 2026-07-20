import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CallsService } from './calls.service';

@ApiTags('Calls')
@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a call' })
  startCall(@Body() body: any) {
    return this.callsService.startCall(body);
  }

  @Post('answer')
  @ApiOperation({ summary: 'Answer a call' })
  answerCall(@Body() body: any) {
    return this.callsService.answerCall(body);
  }

  @Post('reject')
  @ApiOperation({ summary: 'Reject a call' })
  rejectCall(@Body() body: any) {
    return this.callsService.rejectCall(body);
  }

  @Post('end')
  @ApiOperation({ summary: 'End a call' })
  endCall(@Body() body: any) {
    return this.callsService.endCall(body);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get call history' })
  getHistory(@Query() query: any) {
    return this.callsService.getHistory(query);
  }
}

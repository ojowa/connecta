import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Support')
@Controller()
export class SupportController {
  @Post('report')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a support report' })
  reportProblem(@Body('_userId') userId: string, @Body() body: any) {
    return { reportId: `rpt_${Date.now()}`, status: 'submitted', category: body.category, message: 'Thank you for your report. Our team will review it shortly.', createdAt: new Date().toISOString() };
  }
}

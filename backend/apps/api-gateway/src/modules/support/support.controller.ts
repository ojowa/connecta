import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional, MaxLength } from 'class-validator';

class ReportProblemDto {
  @IsString()
  @IsIn(['bug', 'feature', 'account', 'payment', 'safety', 'other'])
  category: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

@ApiTags('Support')
@Controller('support')
export class SupportController {
  @Post('report')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a support report' })
  reportProblem(@Body('_userId') userId: string, @Body() body: ReportProblemDto) {
    const reportId = `rpt_${Date.now()}`;
    return {
      reportId,
      status: 'submitted',
      category: body.category,
      message: 'Thank you for your report. Our team will review it shortly.',
      createdAt: new Date().toISOString(),
    };
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Content')
@Controller()
export class ContentController {
  @Get('safety-tips')
  @ApiOperation({ summary: 'Get safety tips' })
  getSafetyTips() {
    return {
      tips: [
        { id: '1', title: 'Meet in public', description: 'Always meet in a public place for the first time.', icon: 'map-pin' },
        { id: '2', title: 'Tell a friend', description: 'Let someone know where you are going and who you are meeting.', icon: 'users' },
        { id: '3', title: 'Stay sober', description: 'Avoid excessive alcohol or substances on first dates.', icon: 'shield' },
        { id: '4', title: 'Trust your instincts', description: 'If something feels wrong, remove yourself from the situation.', icon: 'alert-triangle' },
        { id: '5', title: 'Protect your info', description: 'Do not share personal or financial information early on.', icon: 'lock' },
        { id: '6', title: 'Video call first', description: 'Do a video call before meeting to verify identity.', icon: 'video' },
      ],
    };
  }
}

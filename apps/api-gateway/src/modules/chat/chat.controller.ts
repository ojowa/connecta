import { Controller, Get, Post, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  @Get('conversations')
  @ApiOperation({ summary: 'Get list of conversations' })
  getConversations(@Query() query: any) {
    return { message: 'Get conversations endpoint — to be implemented' };
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  getMessages(@Param('id') id: string, @Query() query: any) {
    return { message: `Get messages for ${id} — to be implemented` };
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message' })
  sendMessage(@Param('id') id: string, @Body() body: any) {
    return { message: `Send message to ${id} — to be implemented` };
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete a message' })
  deleteMessage(@Param('id') id: string) {
    return { message: `Delete message ${id} — to be implemented` };
  }

  @Post('messages/:id/react')
  @ApiOperation({ summary: 'React to a message' })
  reactToMessage(@Param('id') id: string, @Body() body: any) {
    return { message: `React to message ${id} — to be implemented` };
  }

  @Post('messages/:id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  markRead(@Param('id') id: string) {
    return { message: `Mark message ${id} as read — to be implemented` };
  }

  @Post('typing/:conversationId')
  @ApiOperation({ summary: 'Send typing indicator' })
  sendTyping(@Param('conversationId') conversationId: string) {
    return { message: `Typing indicator for ${conversationId} — to be implemented` };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search messages' })
  searchMessages(@Query() query: any) {
    return { message: 'Search messages endpoint — to be implemented' };
  }
}

import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get conversations' })
  getConversations(@Query() query: any) {
    return this.chatService.getConversations(query);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages' })
  getMessages(@Param('id') id: string, @Query() query: any) {
    return this.chatService.getMessages(id, query);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send message' })
  sendMessage(@Param('id') id: string, @Body() body: any) {
    return this.chatService.sendMessage(id, body);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete message' })
  deleteMessage(@Param('id') id: string) {
    return this.chatService.deleteMessage(id);
  }

  @Post('messages/:id/react')
  @ApiOperation({ summary: 'React to message' })
  reactToMessage(@Param('id') id: string, @Body() body: any) {
    return this.chatService.reactToMessage(id, body);
  }

  @Post('messages/:id/read')
  @ApiOperation({ summary: 'Mark as read' })
  markRead(@Param('id') id: string) {
    return this.chatService.markRead(id);
  }
}

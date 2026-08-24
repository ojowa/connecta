import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get conversations' })
  getConversations(@Headers('x-user-id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.chatService.getConversations(userId, page, limit);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages' })
  getMessages(@Headers('x-user-id') userId: string, @Param('id') conversationId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.chatService.getMessages(userId, conversationId, page, limit);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send message' })
  sendMessage(@Headers('x-user-id') userId: string, @Param('id') conversationId: string, @Body() body: any) {
    return this.chatService.sendMessage(userId, conversationId, body);
  }

  @Delete('conversations/:id/messages/:messageId')
  @ApiOperation({ summary: 'Delete message' })
  deleteMessage(@Headers('x-user-id') userId: string, @Param('id') conversationId: string, @Param('messageId') messageId: string) {
    return this.chatService.deleteMessage(userId, conversationId, messageId);
  }

  @Post('conversations/:id/messages/:messageId/reactions')
  @ApiOperation({ summary: 'React to message' })
  reactToMessage(@Headers('x-user-id') userId: string, @Param('id') conversationId: string, @Param('messageId') messageId: string, @Body() body: any) {
    return this.chatService.reactToMessage(userId, conversationId, messageId, body);
  }

  @Put('conversations/:id/read')
  @ApiOperation({ summary: 'Mark as read' })
  markAsRead(@Headers('x-user-id') userId: string, @Param('id') conversationId: string) {
    return this.chatService.markAsRead(userId, conversationId);
  }

  @Post('conversations/:id/typing')
  @ApiOperation({ summary: 'Send typing indicator' })
  sendTyping(@Headers('x-user-id') userId: string, @Param('id') conversationId: string) {
    return this.chatService.sendTyping(userId, conversationId);
  }

  @Get('messages/search')
  @ApiOperation({ summary: 'Search messages' })
  searchMessages(@Headers('x-user-id') userId: string, @Query('q') query: string, @Query('conversationId') conversationId?: string) {
    return this.chatService.searchMessages(userId, query, conversationId);
  }

  @Get('sync')
  @ApiOperation({ summary: 'Sync chat data' })
  getSync(@Headers('x-user-id') userId: string, @Query('since') since?: string) {
    return this.chatService.getSync(userId, since ? parseInt(since, 10) : 0);
  }
}

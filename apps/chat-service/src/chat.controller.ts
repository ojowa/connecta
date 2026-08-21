import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto, ReactToMessageDto, MarkReadDto, TypingIndicatorDto, SearchMessagesQueryDto } from './dto';

@ApiTags('Chat') @ApiBearerAuth() @Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations') @ApiOperation({ summary: 'List conversations' })
  getConversations(@Body('_userId') userId: string, @Query('page') page?: number, @Query('limit') limit?: number, @Query('filter') filter?: string) {
    return this.chatService.getConversations(userId, page, limit, filter);
  }

  @Get('conversations/:id/messages') @ApiOperation({ summary: 'Get messages' })
  getMessages(@Body('_userId') userId: string, @Param('id') id: string, @Query('limit') limit?: number, @Query('before') before?: string, @Query('after') after?: string) {
    return this.chatService.getMessages(userId, id, limit, before, after);
  }

  @Post('conversations/:id/messages') @ApiOperation({ summary: 'Send message' })
  sendMessage(@Body('_userId') userId: string, @Param('id') id: string, @Body() body: SendMessageDto) {
    return this.chatService.sendMessage(userId, id, body);
  }

  @Post('conversations/:id/messages/:messageId/reactions') @ApiOperation({ summary: 'React to message' })
  react(@Body('_userId') userId: string, @Param('messageId') messageId: string, @Body() body: ReactToMessageDto) {
    return this.chatService.reactToMessage(userId, messageId, body.emoji, body.action);
  }

  @Put('conversations/:id/read') @ApiOperation({ summary: 'Mark as read' })
  markRead(@Body('_userId') userId: string, @Param('id') id: string, @Body() body: MarkReadDto) {
    return this.chatService.markAsRead(userId, id, body.lastReadMessageId);
  }

  @Get('messages/search') @ApiOperation({ summary: 'Search messages' })
  search(@Body('_userId') userId: string, @Query() query: SearchMessagesQueryDto) {
    return this.chatService.searchMessages(userId, query.q, query.conversation_id, query.page, query.limit);
  }

  @Post('conversations/:id/typing') @ApiOperation({ summary: 'Send typing indicator' })
  sendTyping(@Body('_userId') userId: string, @Param('id') id: string, @Body() body: TypingIndicatorDto) {
    return this.chatService.sendTyping(userId, id, body.is_typing);
  }

  @Delete('conversations/:id/messages/:messageId') @ApiOperation({ summary: 'Delete message' })
  deleteMessage(@Body('_userId') userId: string, @Param('messageId') messageId: string) {
    return this.chatService.deleteMessage(userId, messageId);
  }

  @Get('sync') @ApiOperation({ summary: 'Get sync delta for messages' })
  getSync(@Body('_userId') userId: string, @Query('since') since?: string) {
    const sinceTime = since ? parseInt(since, 10) : 0;
    return this.chatService.getSyncDelta(userId, sinceTime);
  }
}

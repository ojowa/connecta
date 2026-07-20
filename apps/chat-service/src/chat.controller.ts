import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';

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
  sendMessage(@Body('_userId') userId: string, @Param('id') id: string, @Body() body: any) {
    return this.chatService.sendMessage(userId, id, body);
  }

  @Post('conversations/:id/messages/:messageId/reactions') @ApiOperation({ summary: 'React to message' })
  react(@Body('_userId') userId: string, @Param('messageId') messageId: string, @Body('emoji') emoji: string, @Body('action') action: 'add' | 'remove') {
    return this.chatService.reactToMessage(userId, messageId, emoji, action);
  }

  @Put('conversations/:id/read') @ApiOperation({ summary: 'Mark as read' })
  markRead(@Body('_userId') userId: string, @Param('id') id: string, @Body('lastReadMessageId') lastReadMessageId: string) {
    return this.chatService.markAsRead(userId, id, lastReadMessageId);
  }

  @Get('messages/search') @ApiOperation({ summary: 'Search messages' })
  search(@Body('_userId') userId: string, @Query('q') q: string, @Query('conversation_id') convId?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.chatService.searchMessages(userId, q, convId, page, limit);
  }

  @Delete('conversations/:id/messages/:messageId') @ApiOperation({ summary: 'Delete message' })
  deleteMessage(@Body('_userId') userId: string, @Param('messageId') messageId: string) {
    return this.chatService.deleteMessage(userId, messageId);
  }
}

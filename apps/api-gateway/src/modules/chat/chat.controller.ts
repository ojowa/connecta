import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { proxyGet, proxyPost, proxyPut, proxyDelete } from '../../helpers/proxy.helper';

const CHAT_SERVICE = process.env.CHAT_SERVICE_URL;

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly http: HttpService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get list of conversations' })
  async getConversations(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${CHAT_SERVICE}/chat/conversations`, req, res);
  }

  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return proxyGet(
      this.http,
      `${CHAT_SERVICE}/chat/conversations/${conversationId}/messages`,
      req,
      res,
    );
  }

  @Post('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return proxyPost(
      this.http,
      `${CHAT_SERVICE}/chat/conversations/${conversationId}/messages`,
      body,
      req,
      res,
    );
  }

  @Post('conversations/:conversationId/messages/:messageId/reactions')
  @ApiOperation({ summary: 'React to a message' })
  async reactToMessage(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return proxyPost(
      this.http,
      `${CHAT_SERVICE}/chat/conversations/${conversationId}/messages/${messageId}/reactions`,
      body,
      req,
      res,
    );
  }

  @Put('conversations/:conversationId/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  async markRead(
    @Param('conversationId') conversationId: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return proxyPut(
      this.http,
      `${CHAT_SERVICE}/chat/conversations/${conversationId}/read`,
      body,
      req,
      res,
    );
  }

  @Post('conversations/:conversationId/typing')
  @ApiOperation({ summary: 'Send typing indicator' })
  async sendTyping(
    @Param('conversationId') conversationId: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return proxyPost(
      this.http,
      `${CHAT_SERVICE}/chat/conversations/${conversationId}/typing`,
      body,
      req,
      res,
    );
  }

  @Get('messages/search')
  @ApiOperation({ summary: 'Search messages' })
  async searchMessages(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${CHAT_SERVICE}/chat/messages/search`, req, res);
  }

  @Delete('conversations/:conversationId/messages/:messageId')
  @ApiOperation({ summary: 'Delete a message' })
  async deleteMessage(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return proxyDelete(
      this.http,
      `${CHAT_SERVICE}/chat/conversations/${conversationId}/messages/${messageId}`,
      req,
      res,
    );
  }

  @Get('sync')
  @ApiOperation({ summary: 'Get sync delta for messages' })
  async getSyncDelta(@Req() req: Request, @Res() res: Response) {
    return proxyGet(this.http, `${CHAT_SERVICE}/chat/sync`, req, res);
  }
}

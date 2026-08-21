import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const CHAT_SERVICE = process.env.CHAT_SERVICE_URL;

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly http: HttpService) {}

  private authHeaders(req: Request) {
    return { authorization: req.headers.authorization };
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get list of conversations' })
  async getConversations(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${CHAT_SERVICE}/chat/conversations`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  async getMessages(@Param('conversationId') conversationId: string, @Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${CHAT_SERVICE}/chat/conversations/${conversationId}/messages`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(@Param('conversationId') conversationId: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${CHAT_SERVICE}/chat/conversations/${conversationId}/messages`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
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
    const result = await firstValueFrom(
      this.http.post(`${CHAT_SERVICE}/chat/conversations/${conversationId}/messages/${messageId}/reactions`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Put('conversations/:conversationId/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  async markRead(
    @Param('conversationId') conversationId: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await firstValueFrom(
      this.http.put(`${CHAT_SERVICE}/chat/conversations/${conversationId}/read`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('conversations/:conversationId/typing')
  @ApiOperation({ summary: 'Send typing indicator' })
  async sendTyping(
    @Param('conversationId') conversationId: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await firstValueFrom(
      this.http.post(`${CHAT_SERVICE}/chat/conversations/${conversationId}/typing`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('messages/search')
  @ApiOperation({ summary: 'Search messages' })
  async searchMessages(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${CHAT_SERVICE}/chat/messages/search`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Delete('conversations/:conversationId/messages/:messageId')
  @ApiOperation({ summary: 'Delete a message' })
  async deleteMessage(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await firstValueFrom(
      this.http.delete(`${CHAT_SERVICE}/chat/conversations/${conversationId}/messages/${messageId}`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('sync')
  @ApiOperation({ summary: 'Get sync delta for messages' })
  async getSyncDelta(@Query('since') since: string, @Req() req: Request, @Res() res: Response) {
    try {
      const result = await firstValueFrom(
        this.http.get(`${CHAT_SERVICE}/chat/sync`, {
          params: { since },
          headers: this.authHeaders(req),
        }),
      );
      return res.status(result.status).json(result.data);
    } catch {
      return res.json({ data: [] });
    }
  }
}

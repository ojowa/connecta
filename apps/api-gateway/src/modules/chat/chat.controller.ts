import { Controller, Get, Post, Delete, Body, Param, Query, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const CHAT_SERVICE = process.env.CHAT_SERVICE_URL || 'http://localhost:3005';

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

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  async getMessages(@Param('id') id: string, @Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${CHAT_SERVICE}/chat/conversations/${id}/messages`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${CHAT_SERVICE}/chat/conversations/${id}/messages`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete a message' })
  async deleteMessage(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.delete(`${CHAT_SERVICE}/chat/messages/${id}`, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('messages/:id/react')
  @ApiOperation({ summary: 'React to a message' })
  async reactToMessage(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${CHAT_SERVICE}/chat/messages/${id}/react`, body, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('messages/:id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  async markRead(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${CHAT_SERVICE}/chat/messages/${id}/read`, {}, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Post('typing/:conversationId')
  @ApiOperation({ summary: 'Send typing indicator' })
  async sendTyping(@Param('conversationId') conversationId: string, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.post(`${CHAT_SERVICE}/chat/typing/${conversationId}`, {}, { headers: this.authHeaders(req) }),
    );
    return res.status(result.status).json(result.data);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search messages' })
  async searchMessages(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const result = await firstValueFrom(
      this.http.get(`${CHAT_SERVICE}/chat/search`, {
        params: query,
        headers: this.authHeaders(req),
      }),
    );
    return res.status(result.status).json(result.data);
  }
}

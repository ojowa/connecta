import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { CHAT_EVENTS } from '@app/common/constants/events';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@app/common/entities';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  afterInit() {
    this.logger.log('Chat Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      client.data.userId = userId;
      client.data.email = payload.email;
      client.data.role = payload.role;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.add(client.id);
      }

      await this.userRepository.update(userId, { lastActiveAt: new Date() });

      client.join(`user:${userId}`);

      this.logger.log(`Client connected: ${client.id} (user: ${userId})`);
      this.server.emit(CHAT_EVENTS.USER_ONLINE, { userId, online: true });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          await this.userRepository.update(userId, { lastActiveAt: new Date() });
          this.server.emit(CHAT_EVENTS.USER_OFFLINE, { userId, online: false });
        }
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(CHAT_EVENTS.MESSAGE_SENT)
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      type?: string;
      mediaId?: string;
      replyToMessageId?: string;
    },
  ) {
    const userId = client.data.userId;
    try {
      const result = await this.chatService.sendMessage(userId, data.conversationId, {
        content: data.content,
        type: data.type || 'text',
        mediaId: data.mediaId,
        replyTo: data.replyToMessageId,
      });

      this.server
        .to(`conversation:${data.conversationId}`)
        .emit(CHAT_EVENTS.MESSAGE_RECEIVED, result.data);
      this.server.to(`user:${userId}`).emit(CHAT_EVENTS.MESSAGE_SENT, result.data);

      return { event: CHAT_EVENTS.MESSAGE_SENT, data: result.data };
    } catch (error) {
      this.logger.error(`Send message error: ${error.message}`);
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage(CHAT_EVENTS.TYPING_START)
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.userId;
    client.to(`conversation:${data.conversationId}`).emit(CHAT_EVENTS.USER_TYPING, {
      userId,
      conversationId: data.conversationId,
      typing: true,
    });
  }

  @SubscribeMessage(CHAT_EVENTS.TYPING_STOP)
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.userId;
    client.to(`conversation:${data.conversationId}`).emit(CHAT_EVENTS.USER_TYPING, {
      userId,
      conversationId: data.conversationId,
      typing: false,
    });
  }

  @SubscribeMessage(CHAT_EVENTS.MESSAGE_READ)
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; lastMessageId: string },
  ) {
    const userId = client.data.userId;
    try {
      await this.chatService.markAsRead(userId, data.conversationId, data.lastMessageId);
      this.server.to(`conversation:${data.conversationId}`).emit(CHAT_EVENTS.MESSAGE_READ, {
        userId,
        conversationId: data.conversationId,
        lastMessageId: data.lastMessageId,
      });
      return { event: CHAT_EVENTS.MESSAGE_READ, data: { success: true } };
    } catch (error) {
      return { event: 'error', data: { message: error.message } };
    }
  }

  async joinConversation(client: Socket, conversationId: string) {
    client.join(`conversation:${conversationId}`);
  }

  async leaveConversation(client: Socket, conversationId: string) {
    client.leave(`conversation:${conversationId}`);
  }

  getUserSockets(userId: string): Set<string> {
    return this.userSockets.get(userId) || new Set();
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  async sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  async sendToConversation(conversationId: string, event: string, data: any) {
    this.server.to(`conversation:${conversationId}`).emit(event, data);
  }
}

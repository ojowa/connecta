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
import { Logger } from '@nestjs/common';
import { CallsService } from './calls.service';
import { JwtService } from '@nestjs/jwt';
import { CALL_EVENTS } from '@app/common/constants/events';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@app/common/entities';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/calls',
  transports: ['websocket', 'polling'],
})
export class CallsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('CallsGateway');
  private userSockets = new Map<string, Set<string>>();
  private activeCalls = new Map<
    string,
    { callerId: string; calleeId: string; callerSocketId: string }
  >();

  constructor(
    private callsService: CallsService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  afterInit() {
    this.logger.log('Calls Gateway initialized');
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

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.add(client.id);
      }

      client.join(`user:${userId}`);

      this.logger.log(`Call client connected: ${client.id} (user: ${userId})`);
    } catch (error) {
      this.logger.error(`Call connection error: ${error.message}`);
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
        }
      }

      for (const [callId, call] of this.activeCalls.entries()) {
        if (call.callerSocketId === client.id || call.calleeId === userId) {
          const otherUserId = call.callerId === userId ? call.calleeId : call.callerId;
          this.server.to(`user:${otherUserId}`).emit(CALL_EVENTS.CALL_ENDED, {
            callId,
            endedBy: userId,
            reason: 'disconnected',
          });
          this.activeCalls.delete(callId);
        }
      }
    }
    this.logger.log(`Call client disconnected: ${client.id}`);
  }

  @SubscribeMessage(CALL_EVENTS.CALL_INITIATED)
  async handleCallInitiated(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { calleeId: string; callType: 'audio' | 'video' },
  ) {
    const callerId = client.data.userId;

    try {
      const result = await this.callsService.startCall({
        callerId,
        recipientId: data.calleeId,
        callType: data.callType,
      });

      this.activeCalls.set(result.callId, {
        callerId,
        calleeId: data.calleeId,
        callerSocketId: client.id,
      });

      const calleeSockets = this.userSockets.get(data.calleeId) || new Set();
      for (const socketId of calleeSockets) {
        this.server.to(socketId).emit(CALL_EVENTS.CALL_RINGING, {
          callId: result.callId,
          callerId,
          callType: data.callType,
        });
      }

      client.emit(CALL_EVENTS.CALL_INITIATED, {
        callId: result.callId,
        status: 'ringing',
      });

      return { event: CALL_EVENTS.CALL_INITIATED, data: { callId: result.callId } };
    } catch (error) {
      this.logger.error(`Call initiation error: ${error.message}`);
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage(CALL_EVENTS.CALL_ANSWERED)
  async handleCallAnswered(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string },
  ) {
    const userId = client.data.userId;

    try {
      await this.callsService.answerCall(data.callId, userId);

      const call = this.activeCalls.get(data.callId);
      if (call) {
        const callerSockets = this.userSockets.get(call.callerId) || new Set();
        for (const socketId of callerSockets) {
          this.server.to(socketId).emit(CALL_EVENTS.CALL_ANSWERED, {
            callId: data.callId,
            answeredBy: userId,
          });
        }
      }

      return { event: CALL_EVENTS.CALL_ANSWERED, data: { callId: data.callId } };
    } catch (error) {
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage(CALL_EVENTS.CALL_REJECTED)
  async handleCallRejected(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string },
  ) {
    const userId = client.data.userId;

    try {
      await this.callsService.rejectCall(data.callId, userId);

      const call = this.activeCalls.get(data.callId);
      if (call) {
        const callerSockets = this.userSockets.get(call.callerId) || new Set();
        for (const socketId of callerSockets) {
          this.server.to(socketId).emit(CALL_EVENTS.CALL_REJECTED, {
            callId: data.callId,
            rejectedBy: userId,
          });
        }
        this.activeCalls.delete(data.callId);
      }

      return { event: CALL_EVENTS.CALL_REJECTED, data: { callId: data.callId } };
    } catch (error) {
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage(CALL_EVENTS.CALL_ENDED)
  async handleCallEnded(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string },
  ) {
    const userId = client.data.userId;

    try {
      await this.callsService.endCall(data.callId, userId);

      const call = this.activeCalls.get(data.callId);
      if (call) {
        const otherUserId = call.callerId === userId ? call.calleeId : call.callerId;
        const otherSockets = this.userSockets.get(otherUserId) || new Set();
        for (const socketId of otherSockets) {
          this.server.to(socketId).emit(CALL_EVENTS.CALL_ENDED, {
            callId: data.callId,
            endedBy: userId,
          });
        }
        this.activeCalls.delete(data.callId);
      }

      return { event: CALL_EVENTS.CALL_ENDED, data: { callId: data.callId } };
    } catch (error) {
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage(CALL_EVENTS.SDP_OFFER)
  handleSdpOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string; offer: RTCSessionDescriptionInit },
  ) {
    const userId = client.data.userId;
    const call = this.activeCalls.get(data.callId);

    if (call) {
      const targetUserId = call.callerId === userId ? call.calleeId : call.callerId;
      const targetSockets = this.userSockets.get(targetUserId) || new Set();
      for (const socketId of targetSockets) {
        this.server.to(socketId).emit(CALL_EVENTS.SDP_OFFER, {
          callId: data.callId,
          offer: data.offer,
          from: userId,
        });
      }
    }

    return { event: CALL_EVENTS.SDP_OFFER, data: { success: true } };
  }

  @SubscribeMessage(CALL_EVENTS.SDP_ANSWER)
  handleSdpAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string; answer: RTCSessionDescriptionInit },
  ) {
    const userId = client.data.userId;
    const call = this.activeCalls.get(data.callId);

    if (call) {
      const targetUserId = call.callerId === userId ? call.calleeId : call.callerId;
      const targetSockets = this.userSockets.get(targetUserId) || new Set();
      for (const socketId of targetSockets) {
        this.server.to(socketId).emit(CALL_EVENTS.SDP_ANSWER, {
          callId: data.callId,
          answer: data.answer,
          from: userId,
        });
      }
    }

    return { event: CALL_EVENTS.SDP_ANSWER, data: { success: true } };
  }

  @SubscribeMessage(CALL_EVENTS.ICE_CANDIDATE)
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string; candidate: RTCIceCandidateInit },
  ) {
    const userId = client.data.userId;
    const call = this.activeCalls.get(data.callId);

    if (call) {
      const targetUserId = call.callerId === userId ? call.calleeId : call.callerId;
      const targetSockets = this.userSockets.get(targetUserId) || new Set();
      for (const socketId of targetSockets) {
        this.server.to(socketId).emit(CALL_EVENTS.ICE_CANDIDATE, {
          callId: data.callId,
          candidate: data.candidate,
          from: userId,
        });
      }
    }

    return { event: CALL_EVENTS.ICE_CANDIDATE, data: { success: true } };
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  async sendToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId) || new Set();
    for (const socketId of sockets) {
      this.server.to(socketId).emit(event, data);
    }
  }
}

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface CallRoom {
  callId: string;
  callerId: string;
  calleeId: string;
  callerSocketId: string;
  calleeSocketId?: string;
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/calls' })
export class CallsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(CallsGateway.name);
  private userSockets = new Map<string, string>();
  private callRooms = new Map<string, CallRoom>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(userId, client.id);
      client.data.userId = userId;
      this.logger.log(`Client connected: ${client.id} (user: ${userId})`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.delete(userId);
      this.logger.log(`Client disconnected: ${client.id} (user: ${userId})`);
    }
  }

  @SubscribeMessage('call.initiated')
  handleCallInitiated(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string; calleeId: string; callerId: string; callType: string },
  ) {
    const room: CallRoom = {
      callId: data.callId,
      callerId: data.callerId,
      calleeId: data.calleeId,
      callerSocketId: client.id,
    };
    this.callRooms.set(data.callId, room);

    const calleeSocketId = this.userSockets.get(data.calleeId);
    if (calleeSocketId) {
      this.server.to(calleeSocketId).emit('call.ringing', {
        callId: data.callId,
        callerId: data.callerId,
        callType: data.callType,
      });
    }

    client.join(data.callId);
    this.logger.log(`Call initiated: ${data.callId} from ${data.callerId} to ${data.calleeId}`);
  }

  @SubscribeMessage('call.answered')
  handleCallAnswered(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string },
  ) {
    const room = this.callRooms.get(data.callId);
    if (room) {
      room.calleeSocketId = client.id;
      client.join(data.callId);

      if (room.callerSocketId) {
        this.server.to(room.callerSocketId).emit('call.answered', { callId: data.callId });
      }
    }
  }

  @SubscribeMessage('call.rejected')
  handleCallRejected(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string; reason?: string },
  ) {
    const room = this.callRooms.get(data.callId);
    if (room) {
      if (room.callerSocketId) {
        this.server.to(room.callerSocketId).emit('call.rejected', {
          callId: data.callId,
          reason: data.reason,
        });
      }
      this.callRooms.delete(data.callId);
    }
  }

  @SubscribeMessage('call.ended')
  handleCallEnded(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string },
  ) {
    const room = this.callRooms.get(data.callId);
    if (room) {
      if (room.callerSocketId && room.callerSocketId !== client.id) {
        this.server.to(room.callerSocketId).emit('call.ended', { callId: data.callId });
      }
      if (room.calleeSocketId && room.calleeSocketId !== client.id) {
        this.server.to(room.calleeSocketId).emit('call.ended', { callId: data.callId });
      }
      this.callRooms.delete(data.callId);
    }
  }

  @SubscribeMessage('sdp.offer')
  handleSdpOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string; sdp: any; targetUserId: string },
  ) {
    const targetSocketId = this.userSockets.get(data.targetUserId);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit('sdp.offer', {
        callId: data.callId,
        sdp: data.sdp,
        fromUserId: client.data.userId,
      });
    }
  }

  @SubscribeMessage('sdp.answer')
  handleSdpAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string; sdp: any; targetUserId: string },
  ) {
    const targetSocketId = this.userSockets.get(data.targetUserId);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit('sdp.answer', {
        callId: data.callId,
        sdp: data.sdp,
        fromUserId: client.data.userId,
      });
    }
  }

  @SubscribeMessage('ice.candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string; candidate: any; targetUserId: string },
  ) {
    const targetSocketId = this.userSockets.get(data.targetUserId);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit('ice.candidate', {
        callId: data.callId,
        candidate: data.candidate,
        fromUserId: client.data.userId,
      });
    }
  }

  sendToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}

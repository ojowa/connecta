import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { io, Socket as ClientSocket } from 'socket.io-client';

const CHAT_SERVICE = process.env.CHAT_SERVICE_URL || 'http://localhost:3005';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
  transports: ['websocket', 'polling'],
})
export class ChatWsProxy implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatWsProxy');
  private clientToUpstream = new Map<string, ClientSocket>();

  handleConnection(@ConnectedSocket() client: Socket) {
    const token = client.handshake.auth?.token || client.handshake.query?.token;
    this.logger.log(`Client connected: ${client.id}`);

    const upstream = io(`${CHAT_SERVICE}/chat`, {
      transports: ['websocket'],
      auth: { token },
    });

    upstream.on('connect', () => {
      this.logger.log(`Upstream connected for client ${client.id}`);
    });

    upstream.onAny((event, ...args) => {
      if (['connect', 'disconnect', 'connect_error'].includes(event)) return;
      client.emit(event, ...args);
    });

    upstream.on('connect_error', (err) => {
      this.logger.error(`Upstream connect error for ${client.id}: ${err.message}`);
    });

    client.onAny((event, ...args) => {
      if (['connect', 'disconnect', 'connect_error'].includes(event)) return;
      if (upstream.connected) {
        upstream.emit(event, ...args);
      }
    });

    this.clientToUpstream.set(client.id, upstream);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const upstream = this.clientToUpstream.get(client.id);
    if (upstream) {
      upstream.disconnect();
      this.clientToUpstream.delete(client.id);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}

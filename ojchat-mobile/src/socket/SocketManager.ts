import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../store';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import { MessageHandler } from './eventHandlers/messageHandler';
import { TypingHandler } from './eventHandlers/typingHandler';
import { PresenceHandler } from './eventHandlers/presenceHandler';
import { MatchHandler } from './eventHandlers/matchHandler';
import { CallHandler } from './eventHandlers/callHandler';
import { resolveWsUrl } from '../lib/network';

class SocketManager {
  private static instance: SocketManager;
  private chatSocket: Socket | null = null;
  private callsSocket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private messageHandler: MessageHandler;
  private typingHandler: TypingHandler;
  private presenceHandler: PresenceHandler;
  private matchHandler: MatchHandler;
  private callHandler: CallHandler;

  static getInstance(): SocketManager {
    if (!SocketManager.instance) SocketManager.instance = new SocketManager();
    return SocketManager.instance;
  }

  private constructor() {
    this.messageHandler = new MessageHandler();
    this.typingHandler = new TypingHandler();
    this.presenceHandler = new PresenceHandler();
    this.matchHandler = new MatchHandler();
    this.callHandler = new CallHandler();
  }

  async connect(): Promise<void> {
    const { token } = useAppStore.getState();
    if (!token) return;

    let wsUrl = await resolveWsUrl();
    if (!wsUrl) return;

    wsUrl = wsUrl.replace(/^ws:\/\//, 'wss://').replace(/^http:\/\//, 'https://');

    if (!this.chatSocket?.connected) {
      this.chatSocket = io(`${wsUrl}/chat`, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 30000,
        timeout: 10000,
      });
      this.registerChatHandlers();
    }

    if (!this.callsSocket?.connected) {
      this.callsSocket = io(`${wsUrl}/calls`, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 30000,
        timeout: 10000,
      });
      this.registerCallHandlers();
    }
  }

  private registerChatHandlers(): void {
    if (!this.chatSocket) return;

    this.chatSocket.on(SOCKET_EVENTS.MESSAGE_RECEIVED, this.messageHandler.onNewMessage);
    this.chatSocket.on(SOCKET_EVENTS.MESSAGE_DELETED, this.messageHandler.onMessageDeleted);
    this.chatSocket.on(SOCKET_EVENTS.MESSAGE_READ, this.messageHandler.onMessageRead);
    this.chatSocket.on(SOCKET_EVENTS.USER_TYPING, this.typingHandler.onTypingStart);
    this.chatSocket.on(SOCKET_EVENTS.USER_ONLINE, this.presenceHandler.onUserOnline);
    this.chatSocket.on(SOCKET_EVENTS.USER_OFFLINE, this.presenceHandler.onUserOffline);
    this.chatSocket.on(SOCKET_EVENTS.MATCH_CREATED, this.matchHandler.onNewMatch);
    this.chatSocket.on(SOCKET_EVENTS.MATCH_MUTUAL, this.matchHandler.onLikeReceived);

    this.chatSocket.on('connect', () => {
      this.reconnectAttempts = 0;
      useAppStore.getState().setOnline(true);
    });
    this.chatSocket.on('disconnect', (reason) => {
      useAppStore.getState().setOnline(false);
      if (reason === 'io server disconnect') this.reconnect();
    });
    this.chatSocket.on('connect_error', () => {
      this.reconnectAttempts++;
    });
  }

  private registerCallHandlers(): void {
    if (!this.callsSocket) return;

    this.callsSocket.on(SOCKET_EVENTS.CALL_RINGING, this.callHandler.onIncomingCall);
    this.callsSocket.on(SOCKET_EVENTS.CALL_ANSWERED, this.callHandler.onCallAccepted);
    this.callsSocket.on(SOCKET_EVENTS.CALL_REJECTED, this.callHandler.onCallRejected);
    this.callsSocket.on(SOCKET_EVENTS.CALL_ENDED, this.callHandler.onCallEnded);
    this.callsSocket.on(SOCKET_EVENTS.SDP_OFFER, this.callHandler.onOffer);
    this.callsSocket.on(SOCKET_EVENTS.SDP_ANSWER, this.callHandler.onAnswer);
    this.callsSocket.on(SOCKET_EVENTS.ICE_CANDIDATE, this.callHandler.onIceCandidate);
  }

  emit(event: string, data?: unknown, callback?: (response: unknown) => void): void {
    const isCallEvent = event.startsWith('call.') || event.startsWith('sdp.') || event.startsWith('ice.');
    const socket = isCallEvent ? this.callsSocket : this.chatSocket;

    if (!socket?.connected) return;
    if (callback) socket.emit(event, data, callback);
    else socket.emit(event, data);
  }

  sendMessage(conversationId: string, content: string, type = 'text'): void {
    this.emit(SOCKET_EVENTS.MESSAGE_SENT, { conversationId, content, type });
  }

  sendTypingStart(conversationId: string): void {
    this.emit(SOCKET_EVENTS.TYPING_START, { conversationId });
  }

  sendTypingStop(conversationId: string): void {
    this.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId });
  }

  markRead(conversationId: string, lastMessageId: string): void {
    this.emit(SOCKET_EVENTS.MESSAGE_READ, { conversationId, lastMessageId });
  }

  rejectCall(callId: string): void {
    this.emit(SOCKET_EVENTS.CALL_REJECTED, { callId });
  }

  private reconnect(): void {
    setTimeout(() => {
      if (this.chatSocket && !this.chatSocket.connected) this.chatSocket.connect();
      if (this.callsSocket && !this.callsSocket.connected) this.callsSocket.connect();
    }, 2000);
  }

  disconnect(): void {
    this.chatSocket?.disconnect();
    this.chatSocket = null;
    this.callsSocket?.disconnect();
    this.callsSocket = null;
  }

  get isConnected(): boolean {
    return this.chatSocket?.connected ?? false;
  }

  get isCallsConnected(): boolean {
    return this.callsSocket?.connected ?? false;
  }
}

export default SocketManager;

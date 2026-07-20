import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../store';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import { MessageHandler } from './eventHandlers/messageHandler';
import { TypingHandler } from './eventHandlers/typingHandler';
import { PresenceHandler } from './eventHandlers/presenceHandler';
import { MatchHandler } from './eventHandlers/matchHandler';
import { CallHandler } from './eventHandlers/callHandler';

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
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

  connect(): void {
    const { token } = useAppStore.getState();
    if (!token || this.socket?.connected) return;
    this.socket = io(process.env.EXPO_PUBLIC_WS_URL!, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      timeout: 10000,
    });
    this.registerEventHandlers();
    this.registerConnectionHandlers();
  }

  private registerEventHandlers(): void {
    if (!this.socket) return;
    this.socket.on(SOCKET_EVENTS.MESSAGE_NEW, this.messageHandler.onNewMessage);
    this.socket.on(SOCKET_EVENTS.MESSAGE_UPDATED, this.messageHandler.onMessageUpdated);
    this.socket.on(SOCKET_EVENTS.MESSAGE_DELETED, this.messageHandler.onMessageDeleted);
    this.socket.on(SOCKET_EVENTS.MESSAGE_READ, this.messageHandler.onMessageRead);
    this.socket.on(SOCKET_EVENTS.TYPING_START, this.typingHandler.onTypingStart);
    this.socket.on(SOCKET_EVENTS.TYPING_STOP, this.typingHandler.onTypingStop);
    this.socket.on(SOCKET_EVENTS.USER_ONLINE, this.presenceHandler.onUserOnline);
    this.socket.on(SOCKET_EVENTS.USER_OFFLINE, this.presenceHandler.onUserOffline);
    this.socket.on(SOCKET_EVENTS.MATCH_NEW, this.matchHandler.onNewMatch);
    this.socket.on(SOCKET_EVENTS.MATCH_LIKE, this.matchHandler.onLikeReceived);
    this.socket.on(SOCKET_EVENTS.CALL_INCOMING, this.callHandler.onIncomingCall);
    this.socket.on(SOCKET_EVENTS.CALL_ACCEPTED, this.callHandler.onCallAccepted);
    this.socket.on(SOCKET_EVENTS.CALL_REJECTED, this.callHandler.onCallRejected);
    this.socket.on(SOCKET_EVENTS.CALL_ENDED, this.callHandler.onCallEnded);
    this.socket.on(SOCKET_EVENTS.WEBRTC_OFFER, this.callHandler.onOffer);
    this.socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, this.callHandler.onAnswer);
    this.socket.on(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, this.callHandler.onIceCandidate);
  }

  private registerConnectionHandlers(): void {
    if (!this.socket) return;
    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      useAppStore.getState().setOnline(true);
    });
    this.socket.on('disconnect', (reason) => {
      useAppStore.getState().setOnline(false);
      if (reason === 'io server disconnect') this.reconnect();
    });
    this.socket.on('connect_error', () => {
      this.reconnectAttempts++;
    });
  }

  emit(event: string, data?: unknown, callback?: (response: unknown) => void): void {
    if (!this.socket?.connected) return;
    if (callback) this.socket.emit(event, data, callback);
    else this.socket.emit(event, data);
  }

  private reconnect(): void {
    setTimeout(() => this.socket?.connect(), 2000);
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export default SocketManager;

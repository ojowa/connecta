import { Message } from './chat';
import { Match } from './match';

export interface SocketEvents {
  'message:send': { conversationId: string; content: string; type: string };
  'message:delivered': { messageId: string };
  'message:read': { conversationId: string; readAt: string; userId: string };
  'typing:start': { conversationId: string; userId: string };
  'typing:stop': { conversationId: string; userId: string };
  'call:signal': { type: string; callId: string; [key: string]: unknown };
  'call:end': { callId: string };
  'message:new': Message;
  'message:updated': { id: string; content: string };
  'message:deleted': { id: string; conversationId: string };
  'user:online': { userId: string };
  'user:offline': { userId: string };
  'match:new': Match;
  'match:like': { fromUserId: string };
  'call:incoming': { callId: string; callerId: string; callerName: string; callerAvatar?: string; type: 'audio' | 'video' };
  'call:accepted': { callId: string };
  'call:rejected': { callId: string };
  'call:ended': { callId: string };
  'webrtc:offer': { callId: string; sdp: RTCSessionDescriptionInit };
  'webrtc:answer': { callId: string; sdp: RTCSessionDescriptionInit };
  'webrtc:ice-candidate': { callId: string; candidate: RTCIceCandidateInit };
}

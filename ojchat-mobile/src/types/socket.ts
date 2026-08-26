import { Message } from './chat';
import { Match } from './match';

export interface SocketEvents {
  'message.sent': { conversationId: string; content: string; type: string };
  'message.received': Message;
  'message.read': { conversationId: string; readAt: string; userId: string };
  'message.deleted': { id: string; conversationId: string };
  'message.reaction': { messageId: string; reaction: string };
  'conversation.created': { conversationId: string };
  'conversation.updated': { conversationId: string };
  'typing.start': { conversationId: string; userId: string };
  'typing.stop': { conversationId: string; userId: string };
  'user.online': { userId: string };
  'user.offline': { userId: string };
  'user.typing': { conversationId: string; userId: string; typing: boolean };
  'match.created': Match;
  'match.mutual': { fromUserId: string };
  'call.initiated': { callId: string; calleeId: string; callType: 'audio' | 'video' };
  'call.ringing': { callId: string; callerId: string; callType: 'audio' | 'video' };
  'call.answered': { callId: string; answeredBy: string };
  'call.rejected': { callId: string; rejectedBy: string };
  'call.ended': { callId: string; endedBy: string; reason?: string };
  'sdp.offer': { callId: string; offer: RTCSessionDescriptionInit; from: string };
  'sdp.answer': { callId: string; answer: RTCSessionDescriptionInit; from: string };
  'ice.candidate': { callId: string; candidate: RTCIceCandidateInit; from: string };
}

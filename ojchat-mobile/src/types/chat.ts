export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  participantAvatars: Record<string, string>;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'video' | 'gif' | 'call';
  status: 'pending' | 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  duration?: number;
  reactions?: Reaction[];
  replyTo?: { id: string; content: string } | string;
  createdAt: string;
  updatedAt: string;
}

export interface CallEvent {
  id: string;
  callerId: string;
  calleeId: string;
  callType: string;
  status: string;
  connectedAt: string | null;
  endedAt: string | null;
  duration: number | null;
  startedAt: string;
}

export interface Reaction {
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

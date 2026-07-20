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
  type: 'text' | 'image' | 'voice' | 'video' | 'gif';
  status: 'pending' | 'sent' | 'delivered' | 'read';
  reactions?: Reaction[];
  replyTo?: string;
  createdAt: string;
  updatedAt: string;
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

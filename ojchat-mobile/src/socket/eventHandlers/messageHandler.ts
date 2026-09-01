import { Message } from '../../types/chat';
import { useAppStore } from '../../store';
import { MessageRepository } from '../../database/repositories/messageRepository';

export class MessageHandler {
  onNewMessage = async (message: Message): Promise<void> => {
    await MessageRepository.insert({
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
    });
    const { activeChatId } = useAppStore.getState();
    if (activeChatId === message.conversationId) {
      useAppStore.getState().addMessage(message);
    } else {
      useAppStore.getState().incrementUnread(message.conversationId);
    }
  };

  onMessageUpdated = async (data: { id: string; content: string }): Promise<void> => {
    useAppStore.getState().updateMessage(data.id, { content: data.content });
  };

  onMessageDeleted = async (data: { id: string; conversationId: string }): Promise<void> => {
    useAppStore.getState().removeMessage(data.id);
  };

  onMessageRead = async (data: {
    conversationId: string;
    readAt: string;
    userId: string;
  }): Promise<void> => {
    await MessageRepository.markAsRead(data.conversationId, data.readAt);
    useAppStore.getState().markMessagesRead(data.conversationId);
  };
}

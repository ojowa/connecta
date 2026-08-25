import { apiClient } from './apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { Conversation, Message } from '../../types/chat';

interface MessagesResponse {
  messages: Message[];
  meta: { page: number; limit: number; hasMore: boolean };
}

interface ConversationsResponse {
  conversations: Conversation[];
  meta: { page: number; limit: number; hasMore: boolean };
}

export const chatApi = {
  async getConversations(page = 1, limit = 20) {
    const response = await apiClient.get(ENDPOINTS.CHAT.CONVERSATIONS, { params: { page, limit } });
    return response.data as ConversationsResponse;
  },

  async getMessages(conversationId: string, page = 1, limit = 50) {
    const response = await apiClient.get(ENDPOINTS.CHAT.MESSAGES(conversationId), { params: { page, limit } });
    return response.data as MessagesResponse;
  },

  async sendMessage(conversationId: string, content: string, type = 'text') {
    const response = await apiClient.post(ENDPOINTS.CHAT.SEND(conversationId), { content, type });
    return response.data as Message;
  },

  async deleteMessage(conversationId: string, messageId: string) {
    const response = await apiClient.delete(ENDPOINTS.CHAT.DELETE(conversationId, messageId));
    return response.data;
  },

  async reactToMessage(conversationId: string, messageId: string, emoji: string) {
    const response = await apiClient.post(ENDPOINTS.CHAT.REACT(conversationId, messageId), { emoji });
    return response.data;
  },

  async markAsRead(conversationId: string) {
    const response = await apiClient.put(ENDPOINTS.CHAT.READ(conversationId));
    return response.data;
  },

  async markMessageAsRead(conversationId: string, messageId: string) {
    const response = await apiClient.post(ENDPOINTS.CHAT.READ_RECEIPT(conversationId, messageId));
    return response.data;
  },

  async sendTyping(conversationId: string) {
    const response = await apiClient.post(ENDPOINTS.CHAT.TYPING(conversationId));
    return response.data;
  },

  async searchMessages(query: string, conversationId?: string) {
    const response = await apiClient.get(ENDPOINTS.CHAT.SEARCH, { params: { q: query, conversationId } });
    return response.data;
  },
};

import { apiClient } from './apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { Conversation, Message } from '../../types/chat';

export const chatApi = {
  async getConversations(page = 1, limit = 20) {
    const response = await apiClient.get(ENDPOINTS.CHAT.CONVERSATIONS, { params: { page, limit } });
    return response.data as ApiResponse<PaginatedResponse<Conversation>>;
  },

  async getMessages(conversationId: string, page = 1, limit = 50) {
    const response = await apiClient.get(ENDPOINTS.CHAT.MESSAGES(conversationId), { params: { page, limit } });
    return response.data as ApiResponse<PaginatedResponse<Message>>;
  },

  async sendMessage(conversationId: string, content: string, type = 'text') {
    const response = await apiClient.post(ENDPOINTS.CHAT.SEND(conversationId), { content, type });
    return response.data as ApiResponse<Message>;
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

  async sendTyping(conversationId: string) {
    const response = await apiClient.post(ENDPOINTS.CHAT.TYPING(conversationId));
    return response.data;
  },

  async searchMessages(query: string, conversationId?: string) {
    const response = await apiClient.get(ENDPOINTS.CHAT.SEARCH, { params: { q: query, conversationId } });
    return response.data;
  },
};

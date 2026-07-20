import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  async getConversations(query: any) {
    return { message: 'Get conversations — to be implemented', conversations: [] };
  }

  async getMessages(conversationId: string, query: any) {
    return { message: `Get messages for ${conversationId} — to be implemented`, messages: [] };
  }

  async sendMessage(conversationId: string, data: any) {
    return { message: `Send message to ${conversationId} — to be implemented` };
  }

  async deleteMessage(id: string) {
    return { message: `Delete message ${id} — to be implemented` };
  }

  async reactToMessage(id: string, data: any) {
    return { message: `React to message ${id} — to be implemented` };
  }

  async markRead(id: string) {
    return { message: `Mark ${id} as read — to be implemented` };
  }
}

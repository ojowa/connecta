import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async getNotifications(query: any) {
    return { message: 'Get notifications — to be implemented', notifications: [] };
  }

  async updatePreferences(data: any) {
    return { message: 'Update preferences — to be implemented' };
  }

  async markRead(data: any) {
    return { message: 'Mark read — to be implemented' };
  }

  async send(data: any) {
    return { message: 'Send notification — to be implemented' };
  }
}

import { apiClient } from './apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { Notification, NotificationPreferences } from '../../types/notification';

export const notificationApi = {
  async getNotifications(page = 1, limit = 20, filter?: string) {
    const response = await apiClient.get(ENDPOINTS.NOTIFICATIONS.LIST, { params: { page, limit, filter } });
    return response.data as ApiResponse<PaginatedResponse<Notification>>;
  },

  async updatePreferences(data: Partial<NotificationPreferences>) {
    const response = await apiClient.put(ENDPOINTS.NOTIFICATIONS.PREFERENCES, data);
    return response.data;
  },

  async markAsRead(notificationIds?: string[], markAll?: boolean) {
    const response = await apiClient.put(ENDPOINTS.NOTIFICATIONS.MARK_READ, { notificationIds, markAll });
    return response.data;
  },

  async registerToken(token: string, platform: string, deviceId?: string) {
    const response = await apiClient.post(ENDPOINTS.NOTIFICATIONS.REGISTER, { token, platform, deviceId });
    return response.data;
  },
};

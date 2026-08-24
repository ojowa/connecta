import { apiClient } from './apiClient';
import { ENDPOINTS } from '../../constants/endpoints';

export const profileApi = {
  async getProfile() {
    const response = await apiClient.get(ENDPOINTS.USERS.ME + '/profile');
    return response.data;
  },

  async updateProfile(data: Record<string, any>) {
    const response = await apiClient.patch(ENDPOINTS.USERS.ME, data);
    return response.data;
  },

  async getPhotos() {
    const response = await apiClient.get(ENDPOINTS.PROFILES.PHOTOS);
    return response.data;
  },

  async uploadPhoto(data: { url: string; order: number }) {
    const response = await apiClient.post(ENDPOINTS.PROFILES.PHOTOS, data);
    return response.data;
  },

  async deletePhoto(photoId: string) {
    const response = await apiClient.delete(ENDPOINTS.PROFILES.DELETE_PHOTO(photoId));
    return response.data;
  },

  async reorderPhotos(orders: { id: string; order: number }[]) {
    const response = await apiClient.put(ENDPOINTS.PROFILES.REORDER_PHOTOS, { orders });
    return response.data;
  },

  async setPrimaryPhoto(photoId: string) {
    const response = await apiClient.put(ENDPOINTS.PROFILES.SET_PRIMARY_PHOTO(photoId));
    return response.data;
  },
};

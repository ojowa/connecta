import { apiClient } from './apiClient';
import { ENDPOINTS } from '../../constants/endpoints';

export const profileApi = {
  async getPhotos() {
    const response = await apiClient.get(ENDPOINTS.PROFILES.PHOTOS);
    return response.data;
  },

  async uploadPhoto(data: { url: string; order: number }, onProgress?: (p: number) => void) {
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

  async submitVerification() {
    const response = await apiClient.post(ENDPOINTS.PROFILES.VERIFY);
    return response.data;
  },

  async getVerificationStatus() {
    const response = await apiClient.get(ENDPOINTS.PROFILES.VERIFICATION_STATUS);
    return response.data;
  },
};

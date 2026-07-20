import { apiClient } from './apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { ApiResponse } from '../../types/api';
import { Profile } from '../../types/match';

export const profileApi = {
  async getProfile(userId: string) {
    const response = await apiClient.get(ENDPOINTS.PROFILES.GET(userId));
    return response.data as ApiResponse<Profile>;
  },

  async updateProfile(data: Partial<Profile>) {
    const response = await apiClient.put(ENDPOINTS.PROFILES.UPDATE, data);
    return response.data;
  },

  async uploadPhoto(formData: FormData, onProgress?: (p: number) => void) {
    const response = await apiClient.post(ENDPOINTS.PROFILES.PHOTOS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
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

  async submitVerification() {
    const response = await apiClient.post(ENDPOINTS.PROFILES.VERIFY);
    return response.data;
  },

  async getInterests(userId: string) {
    const response = await apiClient.get(ENDPOINTS.PROFILES.INTERESTS(userId));
    return response.data;
  },

  async addInterests(interestIds: string[]) {
    const response = await apiClient.post(ENDPOINTS.PROFILES.ADD_INTERESTS, { interestIds });
    return response.data;
  },
};

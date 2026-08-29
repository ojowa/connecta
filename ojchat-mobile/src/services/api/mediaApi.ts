import { apiClient } from './apiClient';
import { ENDPOINTS } from '../../constants/endpoints';

export const mediaApi = {
  async upload(formData: FormData, onProgress?: (p: number) => void) {
    const response = await apiClient.post(ENDPOINTS.MEDIA.UPLOAD, formData, {
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return response.data;
  },

  async getPresignedUrl(filename: string, contentType: string) {
    const response = await apiClient.post(ENDPOINTS.MEDIA.PRESIGNED_URL, { filename, contentType });
    return response.data;
  },

  async getMedia(mediaId: string) {
    const response = await apiClient.get(ENDPOINTS.MEDIA.GET(mediaId));
    return response.data;
  },

  async deleteMedia(mediaId: string) {
    const response = await apiClient.delete(ENDPOINTS.MEDIA.DELETE(mediaId));
    return response.data;
  },
};

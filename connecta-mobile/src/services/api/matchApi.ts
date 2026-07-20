import { apiClient } from './apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { MatchFeedItem, Match, UserPreference } from '../../types/match';

export const matchApi = {
  async getFeed(page = 1, limit = 20) {
    const response = await apiClient.get(ENDPOINTS.MATCHING.FEED, { params: { page, limit } });
    return response.data as ApiResponse<PaginatedResponse<MatchFeedItem>>;
  },

  async like(targetUserId: string) {
    const response = await apiClient.post(ENDPOINTS.MATCHING.LIKE, { targetUserId });
    return response.data;
  },

  async pass(targetUserId: string) {
    const response = await apiClient.post(ENDPOINTS.MATCHING.PASS, { targetUserId });
    return response.data;
  },

  async superLike(targetUserId: string) {
    const response = await apiClient.post(ENDPOINTS.MATCHING.SUPER_LIKE, { targetUserId });
    return response.data;
  },

  async undo() {
    const response = await apiClient.delete(ENDPOINTS.MATCHING.UNDO);
    return response.data;
  },

  async getMatches(page = 1, limit = 20) {
    const response = await apiClient.get(ENDPOINTS.MATCHING.MATCHES, { params: { page, limit } });
    return response.data as ApiResponse<PaginatedResponse<Match>>;
  },

  async getLikedYou(page = 1, limit = 20) {
    const response = await apiClient.get(ENDPOINTS.MATCHING.LIKED_YOU, { params: { page, limit } });
    return response.data;
  },

  async getCompatibility(userId: string) {
    const response = await apiClient.get(ENDPOINTS.MATCHING.COMPATIBILITY(userId));
    return response.data;
  },

  async updatePreferences(data: Partial<UserPreference>) {
    const response = await apiClient.put(ENDPOINTS.MATCHING.PREFERENCES, data);
    return response.data;
  },
};

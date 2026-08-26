import { apiClient } from './apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { MatchFeedItem, Match } from '../../types/match';

interface FeedResponse {
  candidates: MatchFeedItem[];
  meta: { page: number; limit: number; hasMore: boolean };
}

interface MatchListResponse {
  matches: Match[];
  meta: { page: number; limit: number; hasMore: boolean };
}

export const matchApi = {
  async getFeed(page = 1, limit = 20) {
    const response = await apiClient.get(ENDPOINTS.MATCHING.FEED, { params: { page, limit } });
    return response.data as FeedResponse;
  },

  async like(targetUserId: string) {
    const response = await apiClient.post(ENDPOINTS.MATCHING.LIKE(targetUserId));
    return response.data;
  },

  async pass(targetUserId: string) {
    const response = await apiClient.post(ENDPOINTS.MATCHING.PASS(targetUserId));
    return response.data;
  },

  async superLike(targetUserId: string) {
    const response = await apiClient.post(ENDPOINTS.MATCHING.SUPER_LIKE(targetUserId));
    return response.data;
  },

  async undo() {
    const response = await apiClient.post(ENDPOINTS.MATCHING.UNDO);
    return response.data;
  },

  async getMatches(page = 1, limit = 20) {
    const response = await apiClient.get(ENDPOINTS.MATCHING.MATCHES, { params: { page, limit } });
    return response.data as MatchListResponse;
  },

  async unmatch(matchId: string) {
    const response = await apiClient.delete(ENDPOINTS.MATCHING.UNMATCH(matchId));
    return response.data;
  },

  async getLikedYou(page = 1, limit = 20) {
    const response = await apiClient.get(ENDPOINTS.MATCHING.LIKED_YOU, { params: { page, limit } });
    return response.data;
  },

  async getCompatibility(userId: string) {
    const response = await apiClient.get(ENDPOINTS.MATCHING.COMPATIBILITY(userId));
    return response.data;
  },

  async rewind() {
    const response = await apiClient.post(ENDPOINTS.MATCHING.REWIND);
    return response.data;
  },

  async activateBoost() {
    const response = await apiClient.post(ENDPOINTS.MATCHING.BOOST);
    return response.data;
  },

  async getBoostStatus() {
    const response = await apiClient.get(ENDPOINTS.MATCHING.BOOST);
    return response.data;
  },

  async toggleIncognito() {
    const response = await apiClient.post(ENDPOINTS.MATCHING.INCOGNITO);
    return response.data;
  },

  async updatePassport(latitude: number, longitude: number, enabled: boolean) {
    const response = await apiClient.post(ENDPOINTS.MATCHING.PASSPORT, { latitude, longitude, enabled });
    return response.data;
  },

  async likePhoto(photoId: string, profileId: string) {
    const response = await apiClient.post(ENDPOINTS.MATCHING.PHOTO_LIKE(photoId), { profileId });
    return response.data;
  },

  async getPhotoStats() {
    const response = await apiClient.get(ENDPOINTS.MATCHING.PHOTO_STATS);
    return response.data;
  },
};

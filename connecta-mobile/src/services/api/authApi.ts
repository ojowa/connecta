import { apiClient } from './apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { ApiResponse } from '../../types/api';
import { LoginResponse, User, AuthTokens } from '../../types/auth';

export const authApi = {
  async register(data: { email: string; password: string; fullName: string; dateOfBirth: string; gender: string; phone?: string }) {
    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
    return response.data as ApiResponse<LoginResponse>;
  },

  async login(identifier: string, password: string) {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { identifier, password });
    return response.data as ApiResponse<LoginResponse>;
  },

  async sendOtp(channel: string, purpose: string, identifier: string) {
    const response = await apiClient.post(ENDPOINTS.AUTH.OTP_SEND, { channel, purpose, identifier });
    return response.data;
  },

  async verifyOtp(identifier: string, code: string, purpose: string) {
    const response = await apiClient.post(ENDPOINTS.AUTH.OTP_VERIFY, { identifier, code, purpose });
    return response.data;
  },

  async refresh(refreshToken: string) {
    const response = await apiClient.post(ENDPOINTS.AUTH.REFRESH, { refreshToken });
    return response.data as ApiResponse<AuthTokens>;
  },

  async logout(userId: string) {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGOUT, { userId });
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string) {
    const response = await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
    return response.data;
  },
};

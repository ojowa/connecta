import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAppStore } from '../../store';
import { API_CONFIG } from '../../constants/api';
import { resolveApiUrl } from '../../lib/network';

let baseURL = process.env.EXPO_PUBLIC_API_URL;

resolveApiUrl().then((url) => { baseURL = url; });

export const apiClient = axios.create({
  get baseURL() { return baseURL; },
  timeout: API_CONFIG.timeout,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { token } = useAppStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { refreshToken } = useAppStore.getState();
        if (!refreshToken) throw new Error('No refresh token');
        const response = await axios.post(
          `${baseURL}/auth/refresh`,
          { refreshToken }
        );
        const { accessToken, refreshToken: newRefresh } = response.data.data;
        useAppStore.getState().setTokens(accessToken, newRefresh);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAppStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

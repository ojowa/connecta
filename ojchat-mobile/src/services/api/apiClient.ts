import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAppStore } from '../../store';
import { API_CONFIG } from '../../constants/api';
import { resolveApiUrl } from '../../lib/network';

let resolvedBaseURL: string | null = null;

async function getBaseURL(): Promise<string> {
  if (!resolvedBaseURL) {
    resolvedBaseURL = await resolveApiUrl();
  }
  return resolvedBaseURL;
}

export const apiClient = axios.create({
  timeout: API_CONFIG.timeout,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!config.baseURL) {
      config.baseURL = await getBaseURL();
    }
    const { token } = useAppStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    // Auto-unwrap gateway response wrapper: { success, data, timestamp, requestId }
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      response.data = body.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { refreshToken } = useAppStore.getState();
        if (!refreshToken) throw new Error('No refresh token');
        const baseURL = await getBaseURL();
        const response = await axios.post(
          `${baseURL}/auth/refresh`,
          { refreshToken }
        );
        const refreshBody = response.data;
        const tokens = refreshBody?.data || refreshBody;
        const { accessToken, refreshToken: newRefresh } = tokens;
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

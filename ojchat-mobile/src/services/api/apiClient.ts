import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAppStore } from '../../store';
import { API_CONFIG } from '../../constants/api';
import { resolveApiUrl } from '../../lib/network';
import { ENDPOINTS } from '../../constants/endpoints';
import { logger } from '../../utils/logger';

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
  (error) => Promise.reject(error),
);

let inflightRefresh: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  if (inflightRefresh) return inflightRefresh;

  inflightRefresh = (async () => {
    try {
      const { refreshToken } = useAppStore.getState();
      if (!refreshToken) throw new Error('No refresh token');

      const baseURL = await getBaseURL();
      const response = await axios.post(`${baseURL}${ENDPOINTS.AUTH.REFRESH}`, {
        refreshToken,
      });
      const body = response.data;
      const tokens = body?.data || body;
      const accessToken = tokens?.accessToken;
      const newRefresh = tokens?.refreshToken;
      if (!accessToken) throw new Error('Refresh response missing accessToken');

      useAppStore.getState().setTokens(accessToken, newRefresh ?? null);
      return accessToken;
    } finally {
      inflightRefresh = null;
    }
  })();

  return inflightRefresh;
}

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      response.data = body.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const accessToken = await performRefresh();
        originalRequest.headers = originalRequest.headers ?? ({} as any);
        (originalRequest.headers as any).Authorization = `Bearer ${accessToken}`;
        return apiClient.request(originalRequest);
      } catch (refreshError) {
        logger.warn('Token refresh failed, logging out', {
          message: refreshError instanceof Error ? refreshError.message : String(refreshError),
        });
        useAppStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

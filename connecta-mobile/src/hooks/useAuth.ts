import { useAppStore } from '../store';
import { authApi } from '../services/api/authApi';
import { useState } from 'react';
import { Alert } from 'react-native';

export function useAuth() {
  const { user, token, isAuthenticated, setUser, setTokens, setAuthenticated, logout: storeLogout } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(identifier, password);
      const data = response as any;
      // After apiClient unwraps gateway wrapper, response is { user, tokens } directly
      if (data?.user && data?.tokens) {
        setUser(data.user);
        setTokens(data.tokens.accessToken, data.tokens.refreshToken);
        setAuthenticated(true);
        return data;
      }
      // Fallback: check success field if not unwrapped
      if (data?.success && data?.data) {
        setUser(data.data.user);
        setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
        setAuthenticated(true);
        return data.data;
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; fullName: string; dateOfBirth: string; gender: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.register(data);
      const d = response as any;
      if (d?.user && d?.tokens) {
        setUser(d.user);
        setTokens(d.tokens.accessToken, d.tokens.refreshToken);
        setAuthenticated(true);
        return d;
      }
      if (d?.success && d?.data) {
        setUser(d.data.user);
        setTokens(d.data.tokens.accessToken, d.data.tokens.refreshToken);
        setAuthenticated(true);
        return d.data;
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (user) {
      try { await authApi.logout(user.id); } catch { /* local logout still proceeds */ }
    }
    storeLogout();
  };

  return { user, token, isAuthenticated, loading, error, login, register, logout };
}

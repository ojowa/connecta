import { useAppStore } from '../store';
import { authApi } from '../services/api/authApi';
import { useState } from 'react';

export function useAuth() {
  const { user, token, isAuthenticated, setUser, setTokens, setAuthenticated, logout: storeLogout } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(identifier, password);
      if (response.success) {
        setUser(response.data.user);
        setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
        setAuthenticated(true);
        return response.data;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
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
      if (response.success) {
        setUser(response.data.user);
        setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
        setAuthenticated(true);
        return response.data;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (user) {
      try { await authApi.logout(user.id); } catch (error) { console.warn('Logout failed:', error); }
    }
    storeLogout();
  };

  return { user, token, isAuthenticated, loading, error, login, register, logout };
}

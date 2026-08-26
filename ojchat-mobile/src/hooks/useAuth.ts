import { useAppStore } from '../store';
import { authApi } from '../services/api/authApi';
import { useState } from 'react';
import { Alert } from 'react-native';

export function useAuth() {
  const { user, token, isAuthenticated, setUser, setTokens, setAuthenticated, logout: storeLogout } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending2FA, setPending2FA] = useState<{ tempToken: string; method: string } | null>(null);

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    setPending2FA(null);
    try {
      const response = await authApi.login(identifier, password);
      const data = response as any;
      const result = data?.success && data?.data ? data.data : data;

      if (result?.requires2fa) {
        setPending2FA({ tempToken: result.tempToken, method: result.method || 'authenticator' });
        return { requires2fa: true, method: result.method };
      }

      if (result?.user && result?.tokens) {
        setUser(result.user);
        setTokens(result.tokens.accessToken, result.tokens.refreshToken);
        setAuthenticated(true);
        return result;
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verify2faLogin = async (code: string) => {
    if (!pending2FA) throw new Error('No pending 2FA verification');
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.verify2faLogin(pending2FA.tempToken, code);
      const data = response as any;
      const result = data?.success && data?.data ? data.data : data;
      if (result?.user && result?.tokens) {
        setPending2FA(null);
        setUser(result.user);
        setTokens(result.tokens.accessToken, result.tokens.refreshToken);
        setAuthenticated(true);
        return result;
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Verification failed');
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
    setPending2FA(null);
    storeLogout();
  };

  return { user, token, isAuthenticated, loading, error, login, verify2faLogin, pending2FA, register, logout };
}

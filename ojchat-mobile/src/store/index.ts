import { QueryClient } from '@tanstack/react-query';
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

import { mmkvStorage } from '../services/storage/mmkvStorage';
import { secureStorage } from '../services/storage/secureStorage';
import { User } from '../types/auth';
import { Message } from '../types/chat';
import { Match } from '../types/match';

const TOKEN_KEY = 'com.ojchat.tokens';

interface TokenData {
  token: string | null;
  refreshToken: string | null;
}

async function loadTokens(): Promise<TokenData> {
  try {
    const data = await secureStorage.get(TOKEN_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return { token: null, refreshToken: null };
}

async function saveTokens(token: string | null, refreshToken: string | null): Promise<void> {
  if (token || refreshToken) {
    await secureStorage.set(TOKEN_KEY, JSON.stringify({ token, refreshToken }));
  } else {
    await secureStorage.remove(TOKEN_KEY);
  }
}

interface AppState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isBiometricEnabled: boolean;
  isOnline: boolean;
  activeChatId: string | null;
  unreadCounts: Record<string, number>;
  totalUnread: number;
  matches: Match[];
  pendingNewMatch: Match | null;
  setUser: (user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setAuthenticated: (auth: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setOnline: (online: boolean) => void;
  setActiveChatId: (id: string | null) => void;
  updateUnreadCount: (conversationId: string, count: number) => void;
  incrementUnread: (conversationId: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, data: Partial<Message>) => void;
  removeMessage: (id: string) => void;
  markMessagesRead: (conversationId: string) => void;
  addNewMatch: (match: Match) => void;
  clearPendingMatch: () => void;
  logout: () => void;
}

let queryClientRef: QueryClient | null = null;
export function bindQueryClient(client: QueryClient) {
  queryClientRef = client;
}

function patchMessagesCache(id: string, patch: Partial<Message> | null) {
  if (!queryClientRef) return;
  const queries = queryClientRef.getQueryCache().findAll({ queryKey: ['messages'] });
  for (const q of queries) {
    const data = q.state.data as { messages?: Message[] } | undefined;
    if (!data?.messages) continue;
    const messages = data.messages;
    if (patch === null) {
      const next = messages.filter((m) => m.id !== id);
      if (next.length !== messages.length) {
        queryClientRef.setQueryData(q.queryKey, { ...data, messages: next });
      }
    } else {
      let changed = false;
      const next = messages.map((m) => {
        if (m.id === id) {
          changed = true;
          return { ...m, ...patch };
        }
        return m;
      });
      if (changed) {
        queryClientRef.setQueryData(q.queryKey, { ...data, messages: next });
      }
    }
  }
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isBiometricEnabled: false,
        isOnline: true,
        activeChatId: null,
        unreadCounts: {},
        totalUnread: 0,
        matches: [],
        pendingNewMatch: null,

        setUser: (user) => set({ user }),
        setTokens: (token, refreshToken) => {
          saveTokens(token, refreshToken);
          set({ token, refreshToken });
        },
        setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
        setBiometricEnabled: (isBiometricEnabled) => set({ isBiometricEnabled }),
        setOnline: (isOnline) => set({ isOnline }),
        setActiveChatId: (activeChatId) => set({ activeChatId }),
        updateUnreadCount: (conversationId, count) =>
          set((state) => {
            const unreadCounts = { ...state.unreadCounts, [conversationId]: count };
            return {
              unreadCounts,
              totalUnread: Object.values(unreadCounts).reduce((a, b) => a + b, 0),
            };
          }),
        incrementUnread: (conversationId) =>
          set((state) => {
            const current = state.unreadCounts[conversationId] || 0;
            const unreadCounts = { ...state.unreadCounts, [conversationId]: current + 1 };
            return {
              unreadCounts,
              totalUnread: Object.values(unreadCounts).reduce((a, b) => a + b, 0),
            };
          }),
        addMessage: (message) =>
          set((state) => {
            if (
              message.senderId !== state.user?.id &&
              message.conversationId !== state.activeChatId
            ) {
              const current = state.unreadCounts[message.conversationId] || 0;
              const unreadCounts = { ...state.unreadCounts, [message.conversationId]: current + 1 };
              return {
                unreadCounts,
                totalUnread: Object.values(unreadCounts).reduce((a, b) => a + b, 0),
              };
            }
            return {};
          }),
        updateMessage: (id, data) => {
          patchMessagesCache(id, data);
        },
        removeMessage: (id) => {
          patchMessagesCache(id, null);
        },
        markMessagesRead: (conversationId) =>
          set((state) => {
            const unreadCounts = { ...state.unreadCounts, [conversationId]: 0 };
            return {
              unreadCounts,
              totalUnread: Object.values(unreadCounts).reduce((a, b) => a + b, 0),
            };
          }),
        addNewMatch: (match) =>
          set((state) => {
            if (state.matches.some((m) => m.id === match.id)) {
              return { pendingNewMatch: match };
            }
            return { matches: [match, ...state.matches], pendingNewMatch: match };
          }),
        clearPendingMatch: () => set({ pendingNewMatch: null }),
        logout: () => {
          saveTokens(null, null);
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            matches: [],
            pendingNewMatch: null,
          });
        },
      }),
      {
        name: 'ojchat-auth-storage',
        storage: createJSONStorage(() => ({
          getItem: async (name: string) => {
            await mmkvStorage.waitForInit();
            const value = mmkvStorage.getString(name);
            if (!value) return null;
            const parsed = JSON.parse(value);
            const tokens = await loadTokens();
            return {
              ...parsed,
              state: {
                ...parsed.state,
                token: tokens.token,
                refreshToken: tokens.refreshToken,
              },
            };
          },
          setItem: async (name: string, value: unknown) => {
            await mmkvStorage.waitForInit();
            const data = value as any;
            const tokens: TokenData = {
              token: data.state?.token || null,
              refreshToken: data.state?.refreshToken || null,
            };
            await saveTokens(tokens.token, tokens.refreshToken);
            const sanitized = {
              ...data,
              state: {
                ...data.state,
                token: null,
                refreshToken: null,
              },
            };
            mmkvStorage.set(name, JSON.stringify(sanitized));
          },
          removeItem: async (name: string) => {
            await mmkvStorage.waitForInit();
            mmkvStorage.remove(name);
          },
        })),
        partialize: (state) => ({
          token: state.token,
          refreshToken: state.refreshToken,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          isBiometricEnabled: state.isBiometricEnabled,
        }),
      },
    ),
    { name: 'OJChatStore' },
  ),
);

// Test helper: read current state without subscribing (used by tests).
export function getAppState() {
  return useAppStore.getState();
}

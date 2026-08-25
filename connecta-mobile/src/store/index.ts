import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../services/storage/mmkvStorage';
import { User } from '../types/auth';
import { Message } from '../types/chat';

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
  addNewMatch: (match: any) => void;
  logout: () => void;
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

        setUser: (user) => set({ user }),
        setTokens: (token, refreshToken) => set({ token, refreshToken }),
        setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
        setBiometricEnabled: (isBiometricEnabled) => set({ isBiometricEnabled }),
        setOnline: (isOnline) => set({ isOnline }),
        setActiveChatId: (activeChatId) => set({ activeChatId }),
        updateUnreadCount: (conversationId, count) => set((state) => {
          const unreadCounts = { ...state.unreadCounts, [conversationId]: count };
          return { unreadCounts, totalUnread: Object.values(unreadCounts).reduce((a, b) => a + b, 0) };
        }),
        incrementUnread: (conversationId) => set((state) => {
          const current = state.unreadCounts[conversationId] || 0;
          const unreadCounts = { ...state.unreadCounts, [conversationId]: current + 1 };
          return { unreadCounts, totalUnread: Object.values(unreadCounts).reduce((a, b) => a + b, 0) };
        }),
        addMessage: (message) => set((state) => {
          if (message.senderId !== state.user?.id && message.conversationId !== state.activeChatId) {
            const current = state.unreadCounts[message.conversationId] || 0;
            const unreadCounts = { ...state.unreadCounts, [message.conversationId]: current + 1 };
            return { unreadCounts, totalUnread: Object.values(unreadCounts).reduce((a, b) => a + b, 0) };
          }
          return {};
        }),
        updateMessage: (id, data) => {
          // no-op: messages are managed by react-query
        },
        removeMessage: (id) => {
          // no-op: messages are managed by react-query
        },
        markMessagesRead: (conversationId) => set((state) => {
          const unreadCounts = { ...state.unreadCounts, [conversationId]: 0 };
          return { unreadCounts, totalUnread: Object.values(unreadCounts).reduce((a, b) => a + b, 0) };
        }),
        addNewMatch: (match) => set((state) => {
          const matches = (state as any).matches || [];
          if (matches.some((m: any) => m.id === match.id)) return {};
          return { matches: [match, ...matches] } as any;
        }),
        logout: () => set({
          user: null, token: null, refreshToken: null, isAuthenticated: false,
        }),
      }),
      {
        name: 'connecta-auth-storage',
        storage: createJSONStorage(() => ({
          getItem: (name: string) => {
            const value = mmkvStorage.getString(name);
            return value ? JSON.parse(value) : null;
          },
          setItem: (name: string, value: unknown) => {
            mmkvStorage.set(name, JSON.stringify(value));
          },
          removeItem: (name: string) => {
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
      }
    ),
    { name: 'ConnectaStore' }
  )
);

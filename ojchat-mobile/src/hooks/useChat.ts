import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../services/api/chatApi';
import SocketManager from '../socket/SocketManager';

export function useConversations(page = 1) {
  return useQuery({
    queryKey: ['conversations', page],
    queryFn: () => chatApi.getConversations(page),
    staleTime: 30000,
  });
}

export function useMessages(conversationId: string | undefined, page = 1) {
  return useQuery({
    queryKey: ['messages', conversationId, page],
    queryFn: () => chatApi.getMessages(conversationId as string, page),
    enabled: !!conversationId,
    staleTime: 10000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      content,
      type,
      duration,
    }: {
      conversationId: string;
      content: string;
      type?: string;
      duration?: number;
    }) => chatApi.sendMessage(conversationId, content, type, duration),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useDeleteMessage(conversationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => {
      if (!conversationId) throw new Error('No conversation id');
      return chatApi.deleteMessage(conversationId, messageId);
    },
    onSuccess: () => {
      if (!conversationId) return;
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useReactToMessage(conversationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!conversationId) throw new Error('No conversation id');
      return chatApi.reactToMessage(conversationId, messageId, emoji);
    },
    onSuccess: () => {
      if (!conversationId) return;
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });
}

export function useMarkAsRead(conversationId: string) {
  return useMutation({
    mutationFn: () => chatApi.markAsRead(conversationId),
  });
}

export function useSearchMessages() {
  return useQuery({
    queryKey: ['messageSearch'],
    queryFn: ({ queryKey }) => chatApi.searchMessages(queryKey[1] as string),
    enabled: false,
  });
}

export function useTypingIndicator(conversationId: string | undefined) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!conversationId) return;
    const socketManager = SocketManager.getInstance();
    if (!socketManager) return;

    const handleTypingStart = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => [...new Set([...prev, data.userId])]);
      }
    };

    const handleTypingStop = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
      }
    };

    const socket = (socketManager as any).chatSocket;
    if (socket) {
      socket.on('user.typing', handleTypingStart);
      socket.on('user.typing.stop', handleTypingStop);
      return () => {
        socket.off('user.typing', handleTypingStart);
        socket.off('user.typing.stop', handleTypingStop);
      };
    }
  }, [conversationId]);

  return typingUsers;
}

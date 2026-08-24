import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../services/api/chatApi';

export function useConversations(page = 1) {
  return useQuery({
    queryKey: ['conversations', page],
    queryFn: () => chatApi.getConversations(page),
    staleTime: 30000,
  });
}

export function useMessages(conversationId: string, page = 1) {
  return useQuery({
    queryKey: ['messages', conversationId, page],
    queryFn: () => chatApi.getMessages(conversationId, page),
    enabled: !!conversationId,
    staleTime: 10000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, content, type }: { conversationId: string; content: string; type?: string }) =>
      chatApi.sendMessage(conversationId, content, type),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => chatApi.deleteMessage(conversationId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useReactToMessage() {
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      chatApi.reactToMessage(messageId, emoji),
  });
}

export function useMarkAsRead() {
  return useMutation({
    mutationFn: (messageId: string) => chatApi.markAsRead(messageId),
  });
}

export function useSearchMessages() {
  return useQuery({
    queryKey: ['messageSearch'],
    queryFn: ({ queryKey }) => chatApi.searchMessages(queryKey[1] as string),
    enabled: false,
  });
}

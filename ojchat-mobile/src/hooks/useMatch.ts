import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchApi } from '../services/api/matchApi';
import { useAppStore } from '../store';

export function useMatchFeed(page = 1) {
  return useQuery({
    queryKey: ['matchFeed', page],
    queryFn: () => matchApi.getFeed(page),
    staleTime: 60000,
  });
}

export function useLike() {
  const queryClient = useQueryClient();
  const addNewMatch = useAppStore((s) => s.addNewMatch);
  return useMutation({
    mutationFn: (targetUserId: string) => matchApi.like(targetUserId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['matchFeed'] });
      if (data?.matched && data?.matchId) {
        addNewMatch({
          id: data.matchId,
          conversationId: data.conversationId,
          otherUser: { id: data.likerId || data.likedId },
          matchedAt: new Date().toISOString(),
        });
      }
    },
  });
}

export function usePass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetUserId: string) => matchApi.pass(targetUserId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matchFeed'] }),
  });
}

export function useSuperLike() {
  const queryClient = useQueryClient();
  const addNewMatch = useAppStore((s) => s.addNewMatch);
  return useMutation({
    mutationFn: (targetUserId: string) => matchApi.superLike(targetUserId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['matchFeed'] });
      if (data?.matched && data?.matchId) {
        addNewMatch({
          id: data.matchId,
          conversationId: data.conversationId,
          otherUser: { id: data.likerId || data.likedId },
          matchedAt: new Date().toISOString(),
        });
      }
    },
  });
}

export function useUndo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => matchApi.undo(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matchFeed'] }),
  });
}

export function useMatches(page = 1) {
  return useQuery({
    queryKey: ['matches', page],
    queryFn: () => matchApi.getMatches(page),
    refetchOnMount: true,
  });
}

export function useCompatibility(userId: string) {
  return useQuery({
    queryKey: ['compatibility', userId],
    queryFn: () => matchApi.getCompatibility(userId),
    enabled: !!userId,
  });
}

export function usePreferenceModel() {
  return useQuery({
    queryKey: ['preferenceModel'],
    queryFn: () => matchApi.getPreferenceModel(),
    staleTime: 300000,
  });
}

export function useEloScore() {
  return useQuery({
    queryKey: ['eloScore'],
    queryFn: () => matchApi.getEloScore(),
    staleTime: 60000,
  });
}

export function useMyLikes(page = 1) {
  return useQuery({
    queryKey: ['myLikes', page],
    queryFn: () => matchApi.getMyLikes(page),
    staleTime: 30000,
  });
}

export function usePlanInfo() {
  return useQuery({
    queryKey: ['planInfo'],
    queryFn: () => matchApi.getPlanInfo(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

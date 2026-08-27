import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchApi } from '../services/api/matchApi';

export function useMatchFeed(page = 1) {
  return useQuery({
    queryKey: ['matchFeed', page],
    queryFn: () => matchApi.getFeed(page),
    staleTime: 60000,
  });
}

export function useLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetUserId: string) => matchApi.like(targetUserId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matchFeed'] }),
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
  return useMutation({
    mutationFn: (targetUserId: string) => matchApi.superLike(targetUserId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matchFeed'] }),
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
    staleTime: 30000,
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

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useMatchFeed, useLike, usePass, useSuperLike, useUndo } from '../../hooks/useMatch';
import { SwipeableCard } from '../../components/dating/SwipeableCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const DiscoverScreen: React.FC = () => {
  const { data, isLoading, refetch } = useMatchFeed();
  const likeMutation = useLike();
  const passMutation = usePass();
  const superLikeMutation = useSuperLike();
  const undoMutation = useUndo();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) return <LoadingSpinner />;
  const profiles = data?.candidates || [];

  if (profiles.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.empty} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
          <Text style={styles.emptyText}>No more profiles to show</Text>
          <Text style={styles.emptySubtext}>Pull to refresh or check back later</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <SwipeableCard
          profile={profiles[0].profile}
          compatibilityScore={profiles[0].compatibility?.overallScore}
          onSwipeLeft={() => passMutation.mutate(profiles[0].user.id)}
          onSwipeRight={() => likeMutation.mutate(profiles[0].user.id)}
        />
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionButton, styles.undoButton]} onPress={() => undoMutation.mutate()}>
            <Ionicons name="arrow-undo" size={24} color="#f59e0b" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.passButton]} onPress={() => profiles[0] && passMutation.mutate(profiles[0].user.id)}>
            <Ionicons name="close" size={30} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.superLikeButton]} onPress={() => profiles[0] && superLikeMutation.mutate(profiles[0].user.id)}>
            <Ionicons name="star" size={28} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={() => profiles[0] && likeMutation.mutate(profiles[0].user.id)}>
            <Ionicons name="heart" size={28} color="#22c55e" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md, paddingBottom: 70 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyText: { ...typography.h3, marginBottom: spacing.xs },
  emptySubtext: { ...typography.body, color: colors.textSecondary },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  undoButton: { borderWidth: 2, borderColor: '#f59e0b' },
  passButton: { borderWidth: 2, borderColor: '#ef4444' },
  superLikeButton: { borderWidth: 2, borderColor: '#3b82f6' },
  likeButton: { borderWidth: 2, borderColor: '#22c55e' },
});

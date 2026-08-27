import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchFeed, useLike, usePass, useSuperLike, useUndo } from '../../hooks/useMatch';
import { SwipeableCard } from '../../components/dating/SwipeableCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
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
  const viewedIds = useRef(new Set<string>());

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const profiles = data?.candidates || [];

  useEffect(() => {
    if (profiles.length > 0) {
      const uid = profiles[0].user.id;
      if (!viewedIds.current.has(uid)) {
        viewedIds.current.add(uid);
        apiClient.post(ENDPOINTS.MATCHING.PROFILE_VIEW(uid)).catch(() => {});
      }
    }
  }, [profiles]);

  if (isLoading) return <LoadingSpinner />;

  if (profiles.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.empty} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
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
          compatibilityScore={profiles[0].overallScore || profiles[0].compatibility?.overallScore}
          onSwipeLeft={() => passMutation.mutate(profiles[0].user.id)}
          onSwipeRight={() => likeMutation.mutate(profiles[0].user.id)}
          onSuperLike={() => superLikeMutation.mutate(profiles[0].user.id)}
          onUndo={() => undoMutation.mutate()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyText: { ...typography.h3, marginBottom: spacing.xs },
  emptySubtext: { ...typography.body, color: colors.textSecondary },
});

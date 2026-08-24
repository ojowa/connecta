import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useMatchFeed, useLike, usePass } from '../../hooks/useMatch';
import { SwipeableCard } from '../../components/dating/SwipeableCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const DiscoverScreen: React.FC = () => {
  const { data, isLoading, refetch } = useMatchFeed();
  const likeMutation = useLike();
  const passMutation = usePass();
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
        <View style={styles.empty} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
          <Text style={styles.emptyText}>No more profiles to show</Text>
          <Text style={styles.emptySubtext}>Pull to refresh or check back later</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <SwipeableCard
          profile={profiles[0].profile}
          onSwipeLeft={() => passMutation.mutate(profiles[0].user.id)}
          onSwipeRight={() => likeMutation.mutate(profiles[0].user.id)}
        />
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
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useMatchFeed, useLike, usePass } from '../../hooks/useMatch';
import { SwipeableCard } from '../../components/dating/SwipeableCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const DiscoverScreen: React.FC = () => {
  const { data, isLoading } = useMatchFeed();
  const likeMutation = useLike();
  const passMutation = usePass();

  if (isLoading) return <LoadingSpinner />;
  const profiles = data?.data?.data || [];

  if (profiles.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No more profiles to show</Text>
        <Text style={styles.emptySubtext}>Check back later for new matches</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cards}>
        {profiles.map((item: any, index: number) => (
          <SwipeableCard
            key={item.user?.id || index}
            profile={item.profile}
            onSwipeLeft={() => passMutation.mutate(item.user.id)}
            onSwipeRight={() => likeMutation.mutate(item.user.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  cards: { alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyText: { ...typography.h3, marginBottom: spacing.xs },
  emptySubtext: { ...typography.body, color: colors.textSecondary },
});

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMatchFeed, useLike, usePass, useSuperLike, useUndo, usePlanInfo } from '../../hooks/useMatch';
import { SwipeableCard } from '../../components/dating/SwipeableCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { useAppStore } from '../../store';

export const DiscoverScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { data, isLoading, refetch } = useMatchFeed();
  const { data: planInfo } = usePlanInfo();
  const likeMutation = useLike();
  const passMutation = usePass();
  const superLikeMutation = useSuperLike();
  const undoMutation = useUndo();
  const [refreshing, setRefreshing] = useState(false);
  const viewedIds = useRef(new Set<string>());
  const pendingNewMatch = useAppStore((s) => s.pendingNewMatch);
  const clearPendingMatch = useAppStore((s) => s.clearPendingMatch);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const profiles = data?.candidates || [];

  useEffect(() => {
    if (pendingNewMatch && navigation) {
      navigation.navigate('Match', {
        matchedUser: {
          userId: pendingNewMatch.otherUser?.id || pendingNewMatch.user2Id || '',
          fullName: pendingNewMatch.otherUser?.fullName || pendingNewMatch.user2Name || 'Someone',
          avatar: pendingNewMatch.otherUser?.avatarUrl || pendingNewMatch.user2Avatar,
        },
        conversationId: pendingNewMatch.conversationId,
      });
      clearPendingMatch();
    }
  }, [pendingNewMatch, navigation, clearPendingMatch]);

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
        {planInfo && (
          <View style={styles.planBanner}>
            <View style={styles.limitRow}>
              <View style={styles.limitItem}>
                <Ionicons name="heart" size={14} color={colors.primary} />
                <Text style={styles.limitText}>
                  {planInfo.dailyLikes}/{planInfo.dailyLikesLimit} likes
                </Text>
              </View>
              <View style={styles.limitItem}>
                <Ionicons name="star" size={14} color={colors.warning} />
                <Text style={styles.limitText}>
                  {planInfo.dailySuperLikes}/{planInfo.dailySuperLikesLimit} super likes
                </Text>
              </View>
              {!planInfo.isPremium && (
                <TouchableOpacity
                  style={styles.upgradeBadge}
                  onPress={() => navigation?.navigate('Subscription')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.upgradeBadgeText}>Upgrade</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

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
  planBanner: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  limitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  limitText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  upgradeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  upgradeBadgeText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
    fontSize: 11,
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyText: { ...typography.h3, marginBottom: spacing.xs },
  emptySubtext: { ...typography.body, color: colors.textSecondary },
});

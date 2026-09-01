import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  AppState,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchApi } from '../../services/api/matchApi';
import { usePlanInfo } from '../../hooks/useMatch';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Photo } from '../../types/match';
import type { RootStackScreenProps } from '../../navigation/types';
import { formatRelativeTime } from '../../utils/dateUtils';

interface LikeYouItem {
  id: string;
  userId: string;
  likedUserId: string;
  isSuperLike: boolean;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    photos: Photo[];
  };
}

interface LikesYouResponse {
  likes: LikeYouItem[];
  total: number;
  isBlurred: boolean;
}

const LikesYouScreen: React.FC<RootStackScreenProps<'LikesYou'>> = ({ navigation }) => {
  const queryClient = useQueryClient();
  const [likedUserIds, setLikedUserIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const appState = useRef(AppState.currentState);
  const { data: planInfo, refetch: refetchPlan } = usePlanInfo();

  const { data, isLoading, isError, refetch } = useQuery<LikesYouResponse>({
    queryKey: ['likedYou'],
    queryFn: () => matchApi.getLikedYou(1, 50) as Promise<LikesYouResponse>,
    refetchOnMount: true,
    staleTime: 0,
  });

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        refetch();
        refetchPlan();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [refetch, refetchPlan]);

  useEffect(() => {
    const unsub = navigation?.addListener?.('focus', () => {
      refetch();
      refetchPlan();
    });
    return unsub;
  }, [navigation, refetch, refetchPlan]);

  const likeBackMutation = useMutation({
    mutationFn: async (userId: string) => {
      const latestPlan = await refetchPlan();
      if (!latestPlan.data?.isPremium) {
        throw new Error('NOT_PREMIUM');
      }
      return matchApi.like(userId);
    },
    onSuccess: (_data, userId) => {
      setLikedUserIds((prev) => new Set(prev).add(userId));
      queryClient.setQueryData<LikesYouResponse>(['likedYou'], (old) => {
        if (!old) return old;
        return {
          ...old,
          likes: old.likes.filter((l) => l.userId !== userId),
          total: Math.max(0, old.total - 1),
        };
      });
      queryClient.invalidateQueries({ queryKey: ['likedYou'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['matchFeed'] });
    },
    onError: (error: any) => {
      if (error?.message === 'NOT_PREMIUM') {
        Alert.alert(
          'Premium Required',
          'Your subscription may have expired. Please renew to continue using Likes You.',
          [{ text: 'OK' }],
        );
        refetch();
      }
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const likes = data?.likes || [];
  const totalCount = data?.total ?? 0;
  const isBlurred = data?.isBlurred ?? false;

  const getPrimaryPhoto = (photos: Photo[]): string | undefined => {
    const primary = photos?.find((p) => p.isPrimary);
    return primary?.url || photos?.[0]?.url;
  };

  const renderBlurredGrid = () => (
    <View style={styles.paywallContainer}>
      <View style={styles.paywallHeader}>
        <View style={styles.paywallIconCircle}>
          <Ionicons name="lock-closed" size={32} color={colors.white} />
        </View>
        <Text style={styles.paywallTitle}>Who Likes You</Text>
        <Text style={styles.paywallSubtitle}>
          {totalCount} {totalCount === 1 ? 'person' : 'people'} already liked your profile
        </Text>
      </View>

      <View style={styles.blurredGrid}>
        {Array.from({ length: Math.min(totalCount, 9) }).map((_, i) => (
          <View key={i} style={[styles.blurredTile, i % 3 === 0 && styles.blurredTileLarge]}>
            <View style={styles.blurredInner}>
              <Ionicons name="heart" size={20} color={colors.primary} style={{ opacity: 0.3 }} />
            </View>
          </View>
        ))}
        {totalCount > 9 && (
          <View style={[styles.blurredTile, styles.blurredTileMore]}>
            <Text style={styles.blurredMoreText}>+{totalCount - 9}</Text>
          </View>
        )}
      </View>

      <View style={styles.paywallFeatures}>
        <View style={styles.paywallFeatureRow}>
          <Ionicons name="eye" size={20} color={colors.primary} />
          <Text style={styles.paywallFeatureText}>See exactly who liked you</Text>
        </View>
        <View style={styles.paywallFeatureRow}>
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          <Text style={styles.paywallFeatureText}>Match instantly with anyone</Text>
        </View>
        <View style={styles.paywallFeatureRow}>
          <Ionicons name="flash" size={20} color={colors.primary} />
          <Text style={styles.paywallFeatureText}>Get more matches, faster</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.paywallButton}
        onPress={() => navigation.navigate('Subscription')}
        activeOpacity={0.8}
      >
        <Ionicons name="diamond" size={20} color={colors.white} />
        <Text style={styles.paywallButtonText}>Unlock Likes You</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.paywallLink}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={styles.paywallLinkText}>Maybe later</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalCount}</Text>
          <Text style={styles.statLabel}>{totalCount === 1 ? 'Like' : 'Likes'}</Text>
        </View>
        {likes.some((l) => l.isSuperLike) && (
          <View style={[styles.statCard, styles.superStatCard]}>
            <Text style={styles.superStatIcon}>★</Text>
            <Text style={styles.statLabel}>Super Likes</Text>
          </View>
        )}
      </View>
      <Text style={styles.sectionHint}>
        {totalCount > 0
          ? 'Like someone back to start a conversation'
          : "When someone likes you, they'll appear here"}
      </Text>
    </View>
  );

  const renderItem = useCallback(
    ({ item }: { item: LikeYouItem }) => {
      const photoUrl = getPrimaryPhoto(item.user.photos);
      const likedBack = likedUserIds.has(item.user.id);

      return (
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardImageWrap}
            onPress={() => navigation.navigate('UserProfile', { userId: item.user.id })}
            activeOpacity={0.9}
          >
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.cardImage} />
            ) : (
              <View style={styles.cardImagePlaceholder}>
                <Ionicons name="person" size={48} color={colors.gray400} />
              </View>
            )}
            <View style={styles.cardOverlay} />
            {item.isSuperLike && (
              <View style={styles.superBadge}>
                <Text style={styles.superBadgeText}>★</Text>
              </View>
            )}
            <View style={styles.cardTopInfo}>
              <Text style={styles.cardName}>{item.user.fullName}</Text>
              <Text style={styles.cardTime}>{formatRelativeTime(item.createdAt)}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => navigation.navigate('UserProfile', { userId: item.user.id })}
              activeOpacity={0.7}
            >
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.likeBackBtn, likedBack && styles.likeBackBtnDone]}
              onPress={() => !likedBack && likeBackMutation.mutate(item.user.id)}
              disabled={likedBack}
              activeOpacity={0.7}
            >
              {likedBack ? (
                <Ionicons name="checkmark" size={18} color={colors.white} />
              ) : (
                <Ionicons name="heart" size={18} color={colors.white} />
              )}
              <Text style={[styles.likeBackText, likedBack && styles.likeBackTextDone]}>
                {likedBack ? 'Matched!' : 'Like Back'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [likedUserIds, navigation, likeBackMutation],
  );

  if (isLoading) return <LoadingSpinner message="Loading likes..." />;

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState message="Couldn't load who likes you." onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Likes You</Text>
          {totalCount > 0 && !planInfo?.isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={10} color={colors.white} />
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </View>
          )}
          {totalCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{totalCount}</Text>
            </View>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {isBlurred ? (
        renderBlurredGrid()
      ) : likes.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyCircle}>
            <Ionicons name="heart-outline" size={56} color={colors.primary} />
          </View>
          <Text style={styles.emptyText}>No likes yet</Text>
          <Text style={styles.emptySubtext}>
            When someone likes your profile, they'll appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={likes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 3,
  },
  premiumBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  headerSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  superStatCard: {
    backgroundColor: colors.amberLight,
  },
  statNumber: {
    ...typography.h2,
    color: colors.primary,
  },
  superStatIcon: {
    fontSize: 24,
    color: colors.warning,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  card: {
    flex: 1,
    maxWidth: '48%',
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  cardImageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 3 / 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  superBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  superBadgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  cardTopInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cardName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.white,
    fontSize: 15,
  },
  cardTime: {
    ...typography.small,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  cardActions: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeBackBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    gap: 4,
  },
  likeBackBtnDone: {
    backgroundColor: colors.success,
  },
  likeBackText: {
    ...typography.button,
    color: colors.white,
    fontSize: 13,
  },
  likeBackTextDone: {
    color: colors.white,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  paywallContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  paywallHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  paywallIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  paywallTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  paywallSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  blurredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    width: '100%',
  },
  blurredTile: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  blurredTileLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  blurredTileMore: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  blurredInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurredMoreText: {
    ...typography.h3,
    color: colors.white,
  },
  paywallFeatures: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  paywallFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  paywallFeatureText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  paywallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.button,
    gap: spacing.sm,
    width: '100%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  paywallButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
  },
  paywallLink: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  paywallLinkText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});

export default LikesYouScreen;

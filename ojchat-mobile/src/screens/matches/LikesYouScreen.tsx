import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchApi } from '../../services/api/matchApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Photo } from '../../types/match';

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
  meta: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

const LikesYouScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [likedUserIds, setLikedUserIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery<LikesYouResponse>({
    queryKey: ['likedYou', page],
    queryFn: () => matchApi.getLikedYou(page, 20) as Promise<LikesYouResponse>,
  });

  const likeBackMutation = useMutation({
    mutationFn: (userId: string) => matchApi.like(userId),
    onSuccess: (_data, userId) => {
      setLikedUserIds((prev) => new Set(prev).add(userId));
      queryClient.setQueryData<LikesYouResponse>(['likedYou', page], (old) => {
        if (!old) return old;
        return {
          ...old,
          likes: old.likes.filter((l) => l.userId !== userId),
        };
      });
      queryClient.invalidateQueries({ queryKey: ['likedYou'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['matchFeed'] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const likes = data?.likes || [];
  const hasMore = data?.meta?.hasMore ?? false;
  const totalCount = data?.meta?.total ?? 0;

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, isFetching]);

  const getPrimaryPhoto = (photos: Photo[]): string | undefined => {
    const primary = photos?.find((p) => p.isPrimary);
    return primary?.url || photos?.[0]?.url;
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

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
          : 'When someone likes you, they\'ll appear here'}
      </Text>
    </View>
  );

  const renderItem = useCallback(
    ({ item, index }: { item: LikeYouItem; index: number }) => {
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
              <Text style={styles.cardTime}>{formatTime(item.createdAt)}</Text>
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
    [likedUserIds, navigation]
  );

  if (isLoading) return <LoadingSpinner message="Loading likes..." />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Likes You</Text>
          {totalCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{totalCount}</Text>
            </View>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {likes.length === 0 ? (
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
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
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
    backgroundColor: '#FEF3C7',
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
    shadowColor: '#000',
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
    backgroundColor: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
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
});

export default LikesYouScreen;

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
import { Avatar } from '../../components/common/Avatar';
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

const CARD_WIDTH_ARGS = '(100% - 16*3) / 2';

const LikesYouScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [likedUserIds, setLikedUserIds] = useState<Set<string>>(new Set());

  const { data, isLoading, refetch, isFetching } = useQuery<LikesYouResponse>({
    queryKey: ['likedYou', page],
    queryFn: () => matchApi.getLikedYou(page, 20) as Promise<LikesYouResponse>,
  });

  const likeBackMutation = useMutation({
    mutationFn: (userId: string) => matchApi.like(userId),
    onSuccess: (_data, userId) => {
      setLikedUserIds((prev) => new Set(prev).add(userId));
      queryClient.invalidateQueries({ queryKey: ['likedYou'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['matchFeed'] });
    },
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const likes = data?.likes || [];
  const hasMore = data?.meta?.hasMore ?? false;

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, isFetching]);

  const getPrimaryPhoto = (photos: Photo[]): string | undefined => {
    const primary = photos?.find((p) => p.isPrimary);
    return primary?.url || photos?.[0]?.url;
  };

  const renderCard = useCallback(
    ({ item }: { item: LikeYouItem }) => {
      const photoUrl = getPrimaryPhoto(item.user.photos);
      const likedBack = likedUserIds.has(item.user.id);

      return (
        <View style={styles.card}>
          <View style={styles.imageContainer}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.cardImage} />
            ) : (
              <View style={styles.cardImagePlaceholder}>
                <Avatar uri={null} size={64} name={item.user.fullName} />
              </View>
            )}
            <View style={styles.blurOverlay} />
            {item.isSuperLike && (
              <View style={styles.superLikeBadge}>
                <Text style={styles.superLikeText}>★</Text>
              </View>
            )}
          </View>
          <View style={styles.cardContent}>
            <Avatar
              uri={getPrimaryPhoto(item.user.photos)}
              size={40}
              name={item.user.fullName}
              style={styles.cardAvatar}
            />
            <Text style={styles.cardName} numberOfLines={1}>
              {item.user.fullName}
            </Text>
            <TouchableOpacity
              style={[
                styles.likeButton,
                likedBack && styles.likeButtonActive,
              ]}
              onPress={() => likeBackMutation.mutate(item.user.id)}
              disabled={likedBack}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.likeButtonText,
                  likedBack && styles.likeButtonTextActive,
                ]}
              >
                {likedBack ? 'Liked!' : 'Like Back'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [likedUserIds]
  );

  if (isLoading) return <LoadingSpinner message="Loading likes..." />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Likes You</Text>
        <View style={{ width: 24 }} />
      </View>
      {likes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💝</Text>
          <Text style={styles.emptyText}>No likes yet</Text>
          <Text style={styles.emptySubtext}>
            When someone likes you, they'll appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={likes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={renderCard}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
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
    padding: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.h3,
  },
  list: {
    padding: spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  card: {
    flex: 1,
    maxWidth: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: {
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
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlayLight,
  },
  superLikeBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  superLikeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  cardContent: {
    padding: spacing.sm,
    alignItems: 'center',
  },
  cardAvatar: {
    marginBottom: spacing.xs,
  },
  cardName: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  likeButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.button,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  likeButtonActive: {
    backgroundColor: colors.success,
  },
  likeButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 14,
  },
  likeButtonTextActive: {
    color: colors.white,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});

export default LikesYouScreen;

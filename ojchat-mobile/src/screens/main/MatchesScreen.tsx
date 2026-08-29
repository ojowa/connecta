import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useMatches } from '../../hooks/useMatch';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { Match } from '../../types/match';

export const MatchesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data, isLoading, refetch } = useMatches();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) return <LoadingSpinner />;
  const matches = data?.matches || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      <Text style={styles.title}>Matches</Text>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.likesButton} onPress={() => (navigation as any).navigate('LikesYou')}>
          <Ionicons name="heart" size={16} color={colors.white} />
          <Text style={styles.likesButtonText}>Likes You</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.myLikesButton} onPress={() => (navigation as any).navigate('MyLikes')}>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          <Text style={styles.myLikesButtonText}>Your Likes</Text>
        </TouchableOpacity>
      </View>
      {matches.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyCircle}>
            <Ionicons name="people-outline" size={56} color={colors.primary} />
          </View>
          <Text style={styles.emptyText}>No matches yet</Text>
          <Text style={styles.emptySubtext}>Keep swiping to find your match!</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item: Match) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const otherId = item.otherUser?.id;
            const conversationId = (item as any).conversationId;
            return (
              <View style={styles.matchRow}>
                <TouchableOpacity
                  style={styles.matchInfo}
                  onPress={() => otherId && (navigation as any).navigate('UserProfile', { userId: otherId, isMatched: true })}
                  activeOpacity={0.7}
                >
                  {item.otherUser?.avatarUrl ? (
                    <Image source={{ uri: item.otherUser.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarText}>{item.otherUser?.fullName?.charAt(0) || '?'}</Text>
                    </View>
                  )}
                  <View style={styles.matchDetails}>
                    <Text style={styles.matchName} numberOfLines={1}>{item.otherUser?.fullName}</Text>
                    <Text style={styles.matchTime}>
                      {item.matchedAt ? new Date(item.matchedAt).toLocaleDateString() : 'New match'}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={() => {
                    if (!otherId) return;
                    if (conversationId) {
                      (navigation as any).navigate('Conversation', {
                        conversationId,
                        otherUserId: otherId,
                        otherName: item.otherUser?.fullName || 'Unknown',
                        otherAvatar: item.otherUser?.avatarUrl,
                      });
                    } else {
                      (navigation as any).navigate('UserProfile', { userId: otherId, isMatched: true });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble" size={18} color={colors.white} />
                  <Text style={styles.messageButtonText}>Message</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        />
      )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, backgroundColor: colors.white },
  title: { ...typography.h2, padding: spacing.md },
  actionButtons: { flexDirection: 'row', paddingHorizontal: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
  likesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.button,
    gap: spacing.xs,
  },
  likesButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 13,
  },
  myLikesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  myLikesButtonText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 13,
  },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  matchInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.gray100,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryOverlay,
  },
  avatarText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 18,
  },
  matchDetails: {
    flex: 1,
  },
  matchName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  matchTime: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.button,
    gap: spacing.xs,
  },
  messageButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 13,
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: { ...typography.h3, marginBottom: spacing.xs },
  emptySubtext: { ...typography.body, color: colors.textSecondary },
});

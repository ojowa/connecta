import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useMatches } from '../../hooks/useMatch';
import { MatchCard } from '../../components/dating/MatchCard';
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
          <Text style={styles.likesButtonText}>See Who Likes You</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.myLikesButton} onPress={() => (navigation as any).navigate('MyLikes')}>
          <Text style={styles.myLikesButtonText}>Your Likes</Text>
        </TouchableOpacity>
      </View>
      {matches.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💫</Text>
          <Text style={styles.emptyText}>No matches yet</Text>
          <Text style={styles.emptySubtext}>Keep swiping to find your match!</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item: Match) => item.id}
          numColumns={3}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <MatchCard match={item} onPress={() => {
            const otherId = item.otherUser?.id;
            if (!otherId) return;
            navigation.navigate('UserProfile', { userId: otherId, isMatched: true });
          }} />}
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
  searchContainer: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  searchInput: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  searchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  searchAvatarText: { ...typography.button, color: colors.primary },
  searchInfo: { flex: 1 },
  searchName: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  searchUsername: { ...typography.caption, color: colors.textSecondary },
  actionButtons: { flexDirection: 'row', paddingHorizontal: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
  likesButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.button,
    alignItems: 'center',
  },
  likesButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 13,
  },
  myLikesButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  myLikesButtonText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 13,
  },
  list: { padding: spacing.sm },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { ...typography.h3, marginBottom: spacing.xs },
  emptySubtext: { ...typography.body, color: colors.textSecondary },
});

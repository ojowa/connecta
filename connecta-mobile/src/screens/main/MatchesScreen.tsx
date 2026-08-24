import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.title}>Matches</Text>
      <TouchableOpacity style={styles.likesButton} onPress={() => navigation.navigate('LikesYou')}>
        <Text style={styles.likesButtonText}>See Who Likes You</Text>
      </TouchableOpacity>
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
          renderItem={({ item }) => <MatchCard match={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  title: { ...typography.h2, padding: spacing.md },
  likesButton: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.button,
    alignItems: 'center',
  },
  likesButtonText: {
    ...typography.button,
    color: colors.white,
  },
  list: { padding: spacing.sm },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { ...typography.h3, marginBottom: spacing.xs },
  emptySubtext: { ...typography.body, color: colors.textSecondary },
});

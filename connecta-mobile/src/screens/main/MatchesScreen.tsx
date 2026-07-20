import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useMatches } from '../../hooks/useMatch';
import { MatchCard } from '../../components/dating/MatchCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Match } from '../../types/match';

export const MatchesScreen: React.FC = () => {
  const { data, isLoading } = useMatches();
  if (isLoading) return <LoadingSpinner />;
  const matches = data?.data?.data || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Matches</Text>
      {matches.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>No matches yet</Text><Text style={styles.emptySubtext}>Keep swiping to find your match!</Text></View>
      ) : (
        <FlatList data={matches} keyExtractor={(item: Match) => item.id} numColumns={3} contentContainerStyle={styles.list} renderItem={({ item }) => <MatchCard match={item} />} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  title: { ...typography.h2, padding: spacing.md },
  list: { padding: spacing.sm },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...typography.h3, marginBottom: spacing.xs },
  emptySubtext: { ...typography.body, color: colors.textSecondary },
});

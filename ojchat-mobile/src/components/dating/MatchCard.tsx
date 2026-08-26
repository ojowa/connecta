import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { Avatar } from '../common/Avatar';
import { Match } from '../../types/match';

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onPress }) => {
  const photo = match.otherUser?.avatarUrl;
  const compatibilityScore = (match as any).compatibilityScore;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Avatar uri={photo} name={match.otherUser?.fullName} size={64} />
      <Text style={styles.name} numberOfLines={1}>{match.otherUser?.fullName}</Text>
      {typeof compatibilityScore === 'number' && (
        <Text style={styles.score}>{compatibilityScore}%</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { alignItems: 'center', padding: spacing.md, marginRight: spacing.md },
  name: { ...typography.caption, marginTop: spacing.xs, fontWeight: '600' },
  score: { ...typography.small, color: colors.primary, fontWeight: '700', marginTop: 2 },
});

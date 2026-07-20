import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Avatar } from '../common/Avatar';
import { Match } from '../../types/match';

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Avatar uri={match.otherUser?.email ? undefined : undefined} size={64} />
    <Text style={styles.name}>{match.otherUser?.fullName}</Text>
    <Text style={styles.time}>{new Date(match.matchedAt).toLocaleDateString()}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { alignItems: 'center', padding: spacing.md, marginRight: spacing.md },
  name: { ...typography.caption, marginTop: spacing.xs, fontWeight: '600' },
  time: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
});

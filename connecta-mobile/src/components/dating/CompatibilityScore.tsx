import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface CompatibilityScoreProps { score: number; }

export const CompatibilityScore: React.FC<CompatibilityScoreProps> = ({ score }) => (
  <View style={styles.container}>
    <Text style={styles.score}>{score}%</Text>
    <Text style={styles.label}>Compatibility</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  score: { ...typography.h2, color: colors.primary },
  label: { ...typography.small, color: colors.textSecondary },
});

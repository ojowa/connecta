import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface CompatibilityScoreProps {
  score: number;
  size?: 'small' | 'large';
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.primary;
  if (score >= 40) return colors.warning;
  return colors.gray400;
};

export const CompatibilityScore: React.FC<CompatibilityScoreProps> = ({
  score,
  size = 'small',
}) => {
  const color = getScoreColor(score);
  const isLarge = size === 'large';

  return (
    <View
      style={[styles.container, isLarge && styles.containerLarge]}
      accessible
      accessibilityLabel={`${score}% compatible`}
    >
      <View style={[styles.circle, isLarge && styles.circleLarge, { borderColor: color }]}>
        <Text style={[styles.score, isLarge && styles.scoreLarge, { color }]}>{score}</Text>
        {isLarge && <Text style={styles.percent}>%</Text>}
      </View>
      {isLarge && <Text style={styles.label}>Compatibility</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  containerLarge: { paddingVertical: spacing.md },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLarge: { width: 64, height: 64, borderRadius: 32 },
  score: { ...typography.small, fontWeight: '700' },
  scoreLarge: { ...typography.h3 },
  percent: { ...typography.small, color: colors.textSecondary },
  label: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface InterestTagProps {
  label: string;
  size?: 'small' | 'medium';
}

export const InterestTag: React.FC<InterestTagProps> = ({ label, size = 'small' }) => (
  <View
    style={[styles.tag, size === 'medium' && styles.tagMedium]}
    accessible
    accessibilityLabel={`Interest: ${label}`}
  >
    <Text style={[styles.text, size === 'medium' && styles.textMedium]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  tag: {
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  tagMedium: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  text: { ...typography.small, color: colors.primary },
  textMedium: { ...typography.caption, color: colors.primary },
});

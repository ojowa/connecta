import React from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius } from '../../theme/borderRadius';
import { spacing } from '../../theme/spacing';

interface InterestTagProps { name: string; style?: ViewStyle; }

export const InterestTag: React.FC<InterestTagProps> = ({ name, style }) => (
  <Text style={[styles.tag, style]}>{name}</Text>
);

const styles = StyleSheet.create({
  tag: { ...typography.small, backgroundColor: colors.gray100, color: colors.textPrimary, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full, overflow: 'hidden' },
});

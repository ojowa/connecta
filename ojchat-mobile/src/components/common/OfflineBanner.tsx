import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAppStore } from '../../store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const OfflineBanner: React.FC = () => {
  const isOnline = useAppStore((s) => s.isOnline);

  if (isOnline) return null;

  return (
    <View style={styles.banner} accessible accessibilityRole="alert" accessibilityLabel="You are offline">
      <Text style={styles.text}>You're offline. Some features may be unavailable.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.warning, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, alignItems: 'center' },
  text: { ...typography.small, color: colors.white, fontWeight: '600' },
});

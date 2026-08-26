import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface CallControlButton {
  icon: string;
  label: string;
  isActive?: boolean;
  onPress: () => void;
}

interface CallControlsProps {
  buttons: CallControlButton[];
  endCallButton?: { onPress: () => void };
  variant?: 'voice' | 'video';
}

export const CallControls: React.FC<CallControlsProps> = ({ buttons, endCallButton, variant = 'voice' }) => {
  const { width: screenWidth } = useWindowDimensions();
  const voiceButtonWidth = Math.max(60, Math.min(70, screenWidth * 0.18));
  const endCallSize = Math.max(60, Math.min(70, screenWidth * 0.18));
  const videoButtonSize = Math.max(44, Math.min(50, screenWidth * 0.13));
  const videoEndCallSize = Math.max(52, Math.min(60, screenWidth * 0.15));

  if (variant === 'video') {
    return (
      <View style={styles.videoContainer}>
        <View style={styles.videoRow}>
          {buttons.map((btn, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.videoButton, { width: videoButtonSize, height: videoButtonSize, borderRadius: videoButtonSize / 2 }, btn.isActive && styles.videoButtonActive]}
              onPress={btn.onPress}
              activeOpacity={0.8}
              accessible
              accessibilityRole="button"
              accessibilityLabel={btn.label}
              accessibilityState={{ selected: btn.isActive }}
            >
              <Text style={styles.videoIcon}>{btn.icon}</Text>
            </TouchableOpacity>
          ))}
          {endCallButton && (
            <TouchableOpacity style={[styles.videoEndCall, { width: videoEndCallSize, height: videoEndCallSize, borderRadius: videoEndCallSize / 2 }]} onPress={endCallButton.onPress} activeOpacity={0.8} accessible accessibilityRole="button" accessibilityLabel="End call">
              <Text style={styles.endCallIcon}>📞</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.voiceContainer}>
      <View style={styles.voiceRow}>
        {buttons.map((btn, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.voiceButton, { width: voiceButtonWidth }, btn.isActive && styles.voiceButtonActive]}
            onPress={btn.onPress}
            activeOpacity={0.8}
            accessible
            accessibilityRole="button"
            accessibilityLabel={btn.label}
            accessibilityState={{ selected: btn.isActive }}
          >
            <Text style={styles.voiceIcon}>{btn.icon}</Text>
            <Text style={[styles.voiceLabel, btn.isActive && styles.voiceLabelActive]}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {endCallButton && (
        <TouchableOpacity style={[styles.voiceEndCall, { width: endCallSize, height: endCallSize, borderRadius: endCallSize / 2 }]} onPress={endCallButton.onPress} activeOpacity={0.8} accessible accessibilityRole="button" accessibilityLabel="End call">
          <Text style={styles.endCallIcon}>📞</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  voiceContainer: { alignItems: 'center', paddingBottom: spacing.xxl },
  voiceRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xxl, marginBottom: spacing.xl },
  voiceButton: { alignItems: 'center' },
  voiceButtonActive: { opacity: 0.7 },
  voiceIcon: { fontSize: 28, marginBottom: spacing.xs },
  voiceLabel: { ...typography.small, color: colors.whiteOverlaySoft },
  voiceLabelActive: { color: colors.white },
  voiceEndCall: { backgroundColor: colors.error, justifyContent: 'center', alignItems: 'center' },
  videoContainer: { backgroundColor: colors.overlayHeavy },
  videoRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.lg },
  videoButton: { backgroundColor: colors.whiteOverlay, justifyContent: 'center', alignItems: 'center' },
  videoButtonActive: { backgroundColor: colors.whiteOverlayHeavy },
  videoIcon: { fontSize: 22 },
  videoEndCall: { backgroundColor: colors.error, justifyContent: 'center', alignItems: 'center' },
  endCallIcon: { fontSize: 26, transform: [{ rotate: '135deg' }] },
});

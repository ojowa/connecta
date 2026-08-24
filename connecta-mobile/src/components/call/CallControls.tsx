import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
  if (variant === 'video') {
    return (
      <View style={styles.videoContainer}>
        <View style={styles.videoRow}>
          {buttons.map((btn, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.videoButton, btn.isActive && styles.videoButtonActive]}
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
            <TouchableOpacity style={styles.videoEndCall} onPress={endCallButton.onPress} activeOpacity={0.8} accessible accessibilityRole="button" accessibilityLabel="End call">
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
            style={[styles.voiceButton, btn.isActive && styles.voiceButtonActive]}
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
        <TouchableOpacity style={styles.voiceEndCall} onPress={endCallButton.onPress} activeOpacity={0.8} accessible accessibilityRole="button" accessibilityLabel="End call">
          <Text style={styles.endCallIcon}>📞</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  voiceContainer: { alignItems: 'center', paddingBottom: spacing.xxl },
  voiceRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xxl, marginBottom: spacing.xl },
  voiceButton: { alignItems: 'center', width: 70 },
  voiceButtonActive: { opacity: 0.7 },
  voiceIcon: { fontSize: 28, marginBottom: spacing.xs },
  voiceLabel: { ...typography.small, color: colors.whiteOverlaySoft },
  voiceLabelActive: { color: colors.white },
  voiceEndCall: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.error, justifyContent: 'center', alignItems: 'center' },
  videoContainer: { backgroundColor: colors.overlayHeavy },
  videoRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.lg },
  videoButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.whiteOverlay, justifyContent: 'center', alignItems: 'center' },
  videoButtonActive: { backgroundColor: colors.whiteOverlayHeavy },
  videoIcon: { fontSize: 22 },
  videoEndCall: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.error, justifyContent: 'center', alignItems: 'center' },
  endCallIcon: { fontSize: 26, transform: [{ rotate: '135deg' }] },
});

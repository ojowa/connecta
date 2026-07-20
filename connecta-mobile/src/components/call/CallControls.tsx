import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface CallControlsProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerEnabled: boolean;
  callType: 'audio' | 'video';
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onSwitchCamera: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({
  isMuted,
  isVideoEnabled,
  isSpeakerEnabled,
  callType,
  onToggleMute,
  onToggleVideo,
  onSwitchCamera,
  onToggleSpeaker,
  onEndCall,
}) => (
  <View style={styles.container}>
    <TouchableOpacity
      style={[styles.button, isMuted && styles.active]}
      onPress={onToggleMute}
    >
      <Text style={styles.icon}>{isMuted ? '🔇' : '🔊'}</Text>
      <Text style={styles.label}>{isMuted ? 'Unmute' : 'Mute'}</Text>
    </TouchableOpacity>

    {callType === 'video' && (
      <>
        <TouchableOpacity
          style={[styles.button, !isVideoEnabled && styles.active]}
          onPress={onToggleVideo}
        >
          <Text style={styles.icon}>{isVideoEnabled ? '📹' : '📷'}</Text>
          <Text style={styles.label}>{isVideoEnabled ? 'Cam On' : 'Cam Off'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={onSwitchCamera}>
          <Text style={styles.icon}>🔄</Text>
          <Text style={styles.label}>Flip</Text>
        </TouchableOpacity>
      </>
    )}

    <TouchableOpacity
      style={[styles.button, !isSpeakerEnabled && styles.active]}
      onPress={onToggleSpeaker}
    >
      <Text style={styles.icon}>{isSpeakerEnabled ? '🔊' : '🔈'}</Text>
      <Text style={styles.label}>{isSpeakerEnabled ? 'Speaker' : 'Earpiece'}</Text>
    </TouchableOpacity>

    <TouchableOpacity style={[styles.button, styles.endCall]} onPress={onEndCall}>
      <Text style={styles.endIcon}>📞</Text>
      <Text style={styles.endLabel}>End</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.gray700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: colors.primary,
  },
  endCall: {
    backgroundColor: colors.error,
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    ...typography.caption,
    color: colors.gray300,
    marginTop: 2,
  },
  endIcon: {
    fontSize: 28,
  },
  endLabel: {
    ...typography.caption,
    color: colors.white,
    marginTop: 2,
  },
});

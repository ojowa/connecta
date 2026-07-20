import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface CallControlsProps { isMuted: boolean; isVideoEnabled: boolean; onToggleMute: () => void; onToggleVideo: () => void; onSwitchCamera: () => void; onEndCall: () => void; }

export const CallControls: React.FC<CallControlsProps> = ({ isMuted, isVideoEnabled, onToggleMute, onToggleVideo, onSwitchCamera, onEndCall }) => (
  <View style={styles.container}>
    <TouchableOpacity style={[styles.button, isMuted && styles.active]} onPress={onToggleMute}>
      <Text style={styles.icon}>{isMuted ? '🔇' : '🔊'}</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.button, !isVideoEnabled && styles.active]} onPress={onToggleVideo}>
      <Text style={styles.icon}>{isVideoEnabled ? '📹' : '📷'}</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={onSwitchCamera}>
      <Text style={styles.icon}>🔄</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.button, styles.endCall]} onPress={onEndCall}>
      <Text style={styles.icon}>📞</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, paddingVertical: spacing.xl },
  button: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.gray700, alignItems: 'center', justifyContent: 'center' },
  active: { backgroundColor: colors.primary },
  endCall: { backgroundColor: colors.error },
  icon: { fontSize: 24 },
});

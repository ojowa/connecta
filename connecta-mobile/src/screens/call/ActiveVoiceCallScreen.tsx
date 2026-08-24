import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWebRTC } from '../../hooks/useWebRTC';
import { CallControls } from '../../components/call/CallControls';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface ActiveVoiceCallScreenProps {
  navigation?: any;
  route?: {
    params?: {
      callerId: string;
      callerName: string;
      callerAvatar?: string;
      callType: 'voice' | 'video';
    };
  };
}

export const ActiveVoiceCallScreen: React.FC<ActiveVoiceCallScreenProps> = ({ navigation, route }) => {
  const { callerId = '', callerName = '' } = route?.params || {};
  const {
    formattedDuration, isMuted, isSpeakerEnabled, connectionState,
    startCall, endCall, toggleMute, toggleSpeaker,
  } = useWebRTC();

  useEffect(() => {
    if (callerId) startCall(callerId, 'audio');
  }, [callerId]);

  const handleEndCall = useCallback(() => {
    endCall();
    navigation.goBack();
  }, [endCall, navigation]);

  const handleSwitchToVideo = useCallback(() => {
    navigation.replace('ActiveVideoCall', route?.params || {});
  }, [navigation, route?.params]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{formattedDuration}</Text>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{callerName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.callerName}>{callerName}</Text>
          <Text style={styles.callStatus}>{connectionState === 'connected' ? 'On Call' : 'Connecting...'}</Text>
        </View>

        <CallControls
          variant="voice"
          buttons={[
            { icon: isMuted ? '🔇' : '🎤', label: isMuted ? 'Unmute' : 'Mute', isActive: isMuted, onPress: toggleMute },
            { icon: isSpeakerEnabled ? '🔊' : '🔈', label: 'Speaker', isActive: isSpeakerEnabled, onPress: toggleSpeaker },
          ]}
          endCallButton={{ onPress: handleEndCall }}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchText} onPress={handleSwitchToVideo}>Switch to Video</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.textPrimary },
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.xl },
  timerContainer: { alignItems: 'center', paddingTop: spacing.lg },
  timer: { ...typography.body, color: colors.whiteOverlaySoft, fontVariant: ['tabular-nums'] },
  avatarSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.gray600, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
  avatarInitial: { ...typography.h1, color: colors.white },
  callerName: { ...typography.h2, color: colors.white, marginBottom: spacing.xs, textAlign: 'center' },
  callStatus: { ...typography.caption, color: colors.success },
  switchContainer: { alignItems: 'center', paddingBottom: spacing.xxl },
  switchText: { ...typography.small, color: colors.secondary },
});

export default ActiveVoiceCallScreen;

import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RTCView } from 'react-native-webrtc';
import { useWebRTC } from '../../hooks/useWebRTC';
import { CallControls } from '../../components/call/CallControls';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface ActiveVideoCallScreenProps {
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

export const ActiveVideoCallScreen: React.FC<ActiveVideoCallScreenProps> = ({ navigation, route }) => {
  const { callerId = '', callerName = '' } = route?.params || {};
  const [callError, setCallError] = useState<string | null>(null);
  const {
    formattedDuration, isMuted, connectionState, localStream, remoteStream,
    startCall, endCall, toggleMute, toggleVideo, switchCamera,
  } = useWebRTC();

  useEffect(() => {
    if (callerId) {
      startCall(callerId, 'video').catch((err: any) => {
        setCallError(err.message || 'Failed to start call');
        Alert.alert('Call Failed', err.message || 'Could not initialize video call. Please check your connection.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      });
    }
  }, [callerId]);

  const handleEndCall = useCallback(() => {
    endCall();
    navigation.goBack();
  }, [endCall, navigation]);

  const handleSwitchToAudio = useCallback(() => {
    toggleVideo();
    navigation.replace('ActiveVoiceCall', route?.params || {});
  }, [toggleVideo, navigation, route?.params]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formattedDuration}</Text>
      </View>

      <View style={styles.remoteVideoContainer}>
        {remoteStream ? (
          <RTCView streamURL={remoteStream.toURL()} style={styles.remoteVideo} objectFit="cover" />
        ) : (
          <View style={styles.remoteVideo}>
            <Text style={styles.remoteVideoText}>{connectionState === 'connecting' ? 'Connecting...' : 'No video'}</Text>
          </View>
        )}
      </View>

      <View style={styles.localVideoContainer}>
        {localStream ? (
          <RTCView streamURL={localStream.toURL()} style={styles.localVideo} objectFit="cover" zOrder={1} />
        ) : (
          <View style={styles.localVideo}>
            <Text style={styles.localVideoText}>You</Text>
          </View>
        )}
      </View>

      <CallControls
        variant="video"
        buttons={[
          { icon: isMuted ? '🔇' : '🎤', label: 'Mute', isActive: isMuted, onPress: toggleMute },
          { icon: '🔄', label: 'Switch Camera', onPress: switchCamera },
        ]}
        endCallButton={{ onPress: handleEndCall }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.textPrimary },
  timerContainer: { position: 'absolute', top: spacing.xxl, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  timer: { ...typography.body, color: colors.white, fontVariant: ['tabular-nums'], backgroundColor: colors.overlayLight, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.card, overflow: 'hidden' },
  remoteVideoContainer: { flex: 1, padding: spacing.sm },
  remoteVideo: { flex: 1, backgroundColor: colors.gray800, borderRadius: borderRadius.card, justifyContent: 'center', alignItems: 'center' },
  remoteVideoText: { ...typography.body, color: colors.whiteOverlaySofter },
  localVideoContainer: { position: 'absolute', bottom: 120, right: spacing.lg, zIndex: 10 },
  localVideo: { width: 120, height: 160, backgroundColor: colors.gray700, borderRadius: borderRadius.button, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.whiteOverlayMedium },
  localVideoText: { ...typography.small, color: colors.whiteOverlaySofter },
});

export default ActiveVideoCallScreen;

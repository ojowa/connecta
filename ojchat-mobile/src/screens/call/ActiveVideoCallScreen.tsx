import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RTCView } from '../../webrtc/bindings';
import { useWebRTC } from '../../hooks/useWebRTC';
import { CallControls } from '../../components/call/CallControls';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';

interface ActiveVideoCallScreenProps {
  navigation?: any;
  route?: {
    params?: {
      callId?: string;
      callerId: string;
      callerName: string;
      callerAvatar?: string;
      callType: 'audio' | 'video';
      conversationId?: string;
      isInitiator?: boolean;
    };
  };
}

export const ActiveVideoCallScreen: React.FC<ActiveVideoCallScreenProps> = ({ navigation, route }) => {
  const { callId, callerId = '', callerName = '', conversationId, isInitiator = true } = route?.params || {};
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [callError, setCallError] = useState<string | null>(null);
  const pipWidth = Math.min(120, screenWidth * 0.3);
  const pipHeight = pipWidth * 1.33;
  const pipBottom = Math.max(120, screenHeight * 0.15);
  const {
    formattedDuration, isMuted, connectionState, localStream, remoteStream,
    startCall, endCall, toggleMute, toggleVideo, switchCamera,
  } = useWebRTC();

  useEffect(() => {
    if (isInitiator && callerId) {
      startCall(callerId, 'video').catch((err: any) => {
        setCallError(err.message || 'Failed to start call');
        Alert.alert('Call Failed', err.message || 'Could not initialize video call. Please check your connection.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      });
    }
  }, [callerId, isInitiator]);

  const handleEndCall = useCallback(() => {
    endCall();
    if (conversationId) {
      const duration = formattedDuration || '0:00';
      const content = `Video call - ${duration}`;
      apiClient.post(ENDPOINTS.CHAT.SEND(conversationId), { content, type: 'video_call' }).catch(() => {});
    }
    navigation.goBack();
  }, [endCall, navigation, conversationId, formattedDuration]);

  const handleSwitchToAudio = useCallback(() => {
    toggleVideo();
    navigation.replace('ActiveVoiceCall', { ...route?.params, callerId, callerName, conversationId });
  }, [toggleVideo, navigation, route?.params, callerId, callerName, conversationId]);

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

      <View style={[styles.localVideoContainer, { bottom: pipBottom }]}>
        {localStream ? (
          <RTCView streamURL={localStream.toURL()} style={[styles.localVideo, { width: pipWidth, height: pipHeight }]} objectFit="cover" zOrder={1} />
        ) : (
          <View style={[styles.localVideo, { width: pipWidth, height: pipHeight }]}>
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
  localVideoContainer: { position: 'absolute', right: spacing.lg, zIndex: 10 },
  localVideo: { backgroundColor: colors.gray700, borderRadius: borderRadius.button, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.whiteOverlayMedium },
  localVideoText: { ...typography.small, color: colors.whiteOverlaySofter },
});

export default ActiveVideoCallScreen;

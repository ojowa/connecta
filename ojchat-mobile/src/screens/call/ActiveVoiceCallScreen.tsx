import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWebRTC } from '../../hooks/useWebRTC';
import { CallControls } from '../../components/call/CallControls';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { logger } from '../../utils/logger';

interface ActiveVoiceCallScreenProps {
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

export const ActiveVoiceCallScreen: React.FC<ActiveVoiceCallScreenProps> = ({
  navigation,
  route,
}) => {
  const {
    callId,
    callerId = '',
    callerName = '',
    conversationId,
    isInitiator = true,
  } = route?.params || {};
  const [callError, setCallError] = useState<string | null>(null);
  const {
    formattedDuration,
    isMuted,
    isSpeakerEnabled,
    connectionState,
    startCall,
    endCall,
    toggleMute,
    toggleSpeaker,
  } = useWebRTC();

  useEffect(() => {
    if (isInitiator && callerId) {
      startCall(callerId, 'audio').catch((err: any) => {
        setCallError(err.message || 'Failed to start call');
        Alert.alert(
          'Call Failed',
          err.message || 'Could not initialize call. Please check your connection.',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      });
    }
  }, [callerId, isInitiator]);

  const handleEndCall = useCallback(() => {
    endCall();
    if (conversationId) {
      const duration = formattedDuration || '0:00';
      const content = `Voice call - ${duration}`;
      apiClient
        .post(ENDPOINTS.CHAT.SEND(conversationId), { content, type: 'voice_call' })
        .catch((err) => {
          logger.warn('Failed to log voice call', {
            message: err instanceof Error ? err.message : String(err),
          });
        });
    }
    navigation.goBack();
  }, [endCall, navigation, conversationId, formattedDuration]);

  const handleSwitchToVideo = useCallback(() => {
    navigation.replace('ActiveVideoCall', {
      ...route?.params,
      callerId,
      callerName,
      conversationId,
    });
  }, [navigation, route?.params, callerId, callerName, conversationId]);

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
          <Text style={styles.callStatus}>
            {connectionState === 'connected' ? 'On Call' : 'Connecting...'}
          </Text>
        </View>

        <CallControls
          variant="voice"
          buttons={[
            {
              icon: isMuted ? '🔇' : '🎤',
              label: isMuted ? 'Unmute' : 'Mute',
              isActive: isMuted,
              onPress: toggleMute,
            },
            {
              icon: isSpeakerEnabled ? '🔊' : '🔈',
              label: 'Speaker',
              isActive: isSpeakerEnabled,
              onPress: toggleSpeaker,
            },
          ]}
          endCallButton={{ onPress: handleEndCall }}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchText} onPress={handleSwitchToVideo}>
            Switch to Video
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.textPrimary },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  timerContainer: { alignItems: 'center', paddingTop: spacing.lg },
  timer: { ...typography.body, color: colors.whiteOverlaySoft, fontVariant: ['tabular-nums'] },
  avatarSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray600,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarInitial: { ...typography.h1, color: colors.white },
  callerName: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  callStatus: { ...typography.caption, color: colors.success },
  switchContainer: { alignItems: 'center', paddingBottom: spacing.xxl },
  switchText: { ...typography.small, color: colors.secondary },
});

export default ActiveVoiceCallScreen;

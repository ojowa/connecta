import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const ActiveVoiceCallScreen: React.FC<ActiveVoiceCallScreenProps> = ({ navigation, route }) => {
  const { callerName = '', callerAvatar } = route?.params || {};
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const toggleSpeaker = useCallback(() => {
    setIsSpeaker((prev) => !prev);
  }, []);

  const handleEndCall = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    navigation.goBack();
  }, [navigation]);

  const handleSwitchToVideo = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    navigation.replace('ActiveVideoCall', route?.params || {});
  }, [navigation, route?.params]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{formatDuration(duration)}</Text>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            {callerAvatar ? (
              <Text style={styles.avatarInitial}>{callerName.charAt(0).toUpperCase()}</Text>
            ) : (
              <Text style={styles.avatarInitial}>{callerName.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <Text style={styles.callerName}>{callerName}</Text>
          <Text style={styles.callStatus}>On Call</Text>
        </View>

        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={[styles.controlButton, isMuted && styles.controlButtonActive]}
              onPress={toggleMute}
              activeOpacity={0.8}
            >
              <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎤'}</Text>
              <Text style={[styles.controlLabel, isMuted && styles.controlLabelActive]}>
                {isMuted ? 'Unmute' : 'Mute'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, isSpeaker && styles.controlButtonActive]}
              onPress={toggleSpeaker}
              activeOpacity={0.8}
            >
              <Text style={styles.controlIcon}>{isSpeaker ? '🔊' : '🔈'}</Text>
              <Text style={[styles.controlLabel, isSpeaker && styles.controlLabelActive]}>
                Speaker
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall} activeOpacity={0.8}>
            <Text style={styles.endCallIcon}>📞</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchButton} onPress={handleSwitchToVideo} activeOpacity={0.8}>
            <Text style={styles.switchText}>Switch to Video</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.textPrimary,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  timerContainer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  timer: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.7)',
    fontVariant: ['tabular-nums'],
  },
  avatarSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray600,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarInitial: {
    ...typography.h1,
    color: colors.white,
  },
  callerName: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  callStatus: {
    ...typography.caption,
    color: colors.success,
  },
  controls: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xxl,
    marginBottom: spacing.xl,
  },
  controlButton: {
    alignItems: 'center',
    width: 70,
  },
  controlButtonActive: {
    opacity: 0.7,
  },
  controlIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  controlLabel: {
    ...typography.small,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  controlLabelActive: {
    color: colors.white,
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  endCallIcon: {
    fontSize: 30,
    transform: [{ rotate: '135deg' }],
  },
  switchButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  switchText: {
    ...typography.small,
    color: colors.secondary,
  },
});

export default ActiveVoiceCallScreen;

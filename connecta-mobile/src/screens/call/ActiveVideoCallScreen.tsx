import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RTCView } from 'react-native-webrtc';
import WebRTCManager from '../../webrtc/WebRTCManager';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

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

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const ActiveVideoCallScreen: React.FC<ActiveVideoCallScreenProps> = ({ navigation, route }) => {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [callState, setCallState] = useState<string>('connecting');
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [localStream, setLocalStream] = useState<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webrtc = WebRTCManager.getInstance();

  const callerId = route?.params?.callerId || '';
  const callType = route?.params?.callType || 'video';

  useEffect(() => {
    if (!callerId) return;
    webrtc.startCall(callerId, callType as 'audio' | 'video');

    const unsubscribe = webrtc.onStateChangeHandler((state) => {
      if (state) {
        setCallState(state.state);
        setRemoteStream(state.remoteStream);
        setLocalStream(state.localStream);
        if (state.state === 'connected' && !intervalRef.current) {
          intervalRef.current = setInterval(() => setDuration((p) => p + 1), 1000);
        }
      }
    });

    return () => {
      unsubscribe();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [callerId, callType]);

  const toggleMute = useCallback(() => {
    webrtc.toggleMute();
    setIsMuted((prev) => !prev);
  }, []);

  const toggleCamera = useCallback(() => {
    webrtc.toggleVideo();
    setIsFrontCamera((prev) => !prev);
  }, []);

  const handleEndCall = useCallback(() => {
    webrtc.endCall();
    if (intervalRef.current) clearInterval(intervalRef.current);
    navigation.goBack();
  }, [navigation]);

  const handleSwitchToAudio = useCallback(() => {
    webrtc.toggleVideo();
    setIsFrontCamera(true);
    navigation.replace('ActiveVoiceCall', route?.params || {});
  }, [navigation, route?.params]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formatDuration(duration)}</Text>
      </View>

      <View style={styles.remoteVideoContainer}>
        {remoteStream ? (
          <RTCView streamURL={remoteStream.toURL()} style={styles.remoteVideo} objectFit="cover" />
        ) : (
          <View style={styles.remoteVideo}>
            <Text style={styles.remoteVideoText}>{callState === 'connecting' ? 'Connecting...' : 'No video'}</Text>
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

      <View style={styles.bottomOverlay}>
        <SafeAreaView style={styles.bottomBar}>
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={[styles.bottomButton, isMuted && styles.bottomButtonActive]}
              onPress={toggleMute}
              activeOpacity={0.8}
            >
              <Text style={styles.bottomButtonIcon}>{isMuted ? '🔇' : '🎤'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomButton}
              onPress={toggleCamera}
              activeOpacity={0.8}
            >
              <Text style={styles.bottomButtonIcon}>🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall} activeOpacity={0.8}>
              <Text style={styles.endCallIcon}>📞</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchButton} onPress={handleSwitchToAudio} activeOpacity={0.8}>
              <Text style={styles.switchText}>Switch to{'\n'}Audio</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.textPrimary,
  },
  timerContainer: {
    position: 'absolute',
    top: spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  timer: {
    ...typography.body,
    color: colors.white,
    fontVariant: ['tabular-nums'],
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    overflow: 'hidden',
  },
  remoteVideoContainer: {
    flex: 1,
    padding: spacing.sm,
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: colors.gray800,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remoteVideoText: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  localVideoContainer: {
    position: 'absolute',
    bottom: 120,
    right: spacing.lg,
    zIndex: 10,
  },
  localVideo: {
    width: 120,
    height: 160,
    backgroundColor: colors.gray700,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  localVideoText: {
    ...typography.small,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  bottomOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  bottomBar: {
    paddingHorizontal: spacing.xl,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  bottomButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  bottomButtonIcon: {
    fontSize: 22,
  },
  endCallButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallIcon: {
    fontSize: 26,
    transform: [{ rotate: '135deg' }],
  },
  switchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    ...typography.small,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default ActiveVideoCallScreen;

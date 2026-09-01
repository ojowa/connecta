import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface VoiceMessageProps {
  url: string;
  duration?: number;
  isOwn: boolean;
}

const WAVEFORM_BARS = 28;

export const VoiceMessage: React.FC<VoiceMessageProps> = ({ url, duration, isOwn }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState((duration || 0) * 1000);
  const [isLoaded, setIsLoaded] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveformAnims = useRef(
    Array.from({ length: WAVEFORM_BARS }, () => new Animated.Value(0.3)),
  ).current;

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence(
          waveformAnims.map((anim) =>
            Animated.timing(anim, {
              toValue: 0.3 + Math.random() * 0.7,
              duration: 150 + Math.random() * 200,
              easing: Easing.ease,
              useNativeDriver: false,
            }),
          ),
        ),
      ).start();
    } else {
      waveformAnims.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isPlaying]);

  const loadAndPlay = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        onPlaybackStatusUpdate,
      );
      setSound(newSound);
      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to play voice message', err);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setIsLoaded(true);
    setPosition(status.positionMillis);
    setTotalDuration(status.durationMillis || 0);
    if (status.didJustFinish) {
      setIsPlaying(false);
      setPosition(0);
      sound?.setPositionAsync(0);
    }
  };

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? position / totalDuration : 0;

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      <TouchableOpacity style={styles.playButton} onPress={loadAndPlay} activeOpacity={0.7}>
        <Animated.View style={[styles.playIconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={18}
            color={isOwn ? colors.white : colors.primary}
          />
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.waveformContainer}>
        <View style={styles.waveform}>
          {waveformAnims.map((anim, i) => {
            const barProgress = i / WAVEFORM_BARS;
            const isActive = barProgress <= progress;
            return (
              <Animated.View
                key={i}
                style={[
                  styles.waveformBar,
                  {
                    height: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [4, 18],
                    }),
                    backgroundColor: isActive
                      ? isOwn
                        ? 'rgba(255,255,255,0.9)'
                        : colors.primary
                      : isOwn
                        ? 'rgba(255,255,255,0.3)'
                        : colors.gray300,
                  },
                ]}
              />
            );
          })}
        </View>
        <Text style={[styles.duration, isOwn ? styles.ownText : styles.otherText]}>
          {formatTime(position)} / {formatTime(totalDuration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
    maxWidth: 260,
    gap: spacing.sm,
  },
  ownContainer: {},
  otherContainer: {},
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformContainer: {
    flex: 1,
  },
  waveform: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
    height: 24,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
    minHeight: 4,
  },
  duration: {
    ...typography.small,
    marginTop: 2,
  },
  ownText: { color: 'rgba(255,255,255,0.7)' },
  otherText: { color: colors.textSecondary },
});

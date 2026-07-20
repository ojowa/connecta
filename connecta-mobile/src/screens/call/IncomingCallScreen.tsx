import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebRTCManager from '../../webrtc/WebRTCManager';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface IncomingCallScreenProps {
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

export const IncomingCallScreen: React.FC<IncomingCallScreenProps> = ({ navigation, route }) => {
  const { callerName = '', callerAvatar, callType = 'voice' } = route?.params || {};

  const handleDecline = () => {
    WebRTCManager.getInstance().endCall();
    navigation.goBack();
  };

  const handleAccept = () => {
    const params: any = route?.params || {};
    const callId = params.callId || '';
    // acceptCall requires an SDP offer — in production this comes via socket signal
    // For now, navigate to the active call screen which will handle the connection
    if (callType === 'video') {
      navigation.replace('ActiveVideoCall', params);
    } else {
      navigation.replace('ActiveVoiceCall', params);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={callerAvatar ? { uri: callerAvatar } : undefined}
        style={styles.background}
        blurRadius={30}
      >
        <View style={styles.overlay} />
        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {callerAvatar ? (
                <ImageBackground
                  source={{ uri: callerAvatar }}
                  style={styles.avatarImage}
                  imageStyle={styles.avatarImageInner}
                />
              ) : (
                <Text style={styles.avatarInitial}>{callerName.charAt(0).toUpperCase()}</Text>
              )}
            </View>
          </View>

          <Text style={styles.callerName}>{callerName}</Text>
          <Text style={styles.callType}>{callType === 'video' ? 'Video Call' : 'Voice Call'}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.declineButton} onPress={handleDecline} activeOpacity={0.8}>
              <View style={[styles.actionIcon, { backgroundColor: colors.error }]}>
                <Text style={styles.actionIconText}>✕</Text>
              </View>
              <Text style={styles.actionLabel}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept} activeOpacity={0.8}>
              <View style={[styles.actionIcon, { backgroundColor: colors.success }]}>
                <Text style={styles.actionIconText}>📞</Text>
              </View>
              <Text style={styles.actionLabel}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray600,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 120,
    height: 120,
  },
  avatarImageInner: {
    borderRadius: 60,
  },
  avatarInitial: {
    ...typography.h1,
    color: colors.white,
  },
  callerName: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  callType: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: spacing.xxl,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xxl,
  },
  declineButton: {
    alignItems: 'center',
  },
  acceptButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionIconText: {
    fontSize: 28,
    color: colors.white,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.white,
  },
});

export default IncomingCallScreen;

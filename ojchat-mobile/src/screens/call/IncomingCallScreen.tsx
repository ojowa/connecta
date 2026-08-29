import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SocketManager from '../../socket/SocketManager';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useAppStore } from '../../store';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';

interface IncomingCallScreenProps {
  navigation?: any;
  route?: {
    params?: {
      callId: string;
      callerId: string;
      callerName: string;
      callerAvatar?: string;
      callType: 'audio' | 'video';
      conversationId?: string;
    };
  };
}

export const IncomingCallScreen: React.FC<IncomingCallScreenProps> = ({ navigation, route }) => {
  const { callId, callerId, callerName = '', callerAvatar, callType = 'audio', conversationId } = route?.params || {};
  const { width: screenWidth } = useWindowDimensions();
  const avatarSize = Math.min(120, screenWidth * 0.3);
  const buttonSize = Math.min(70, screenWidth * 0.18);

  const handleDecline = () => {
    if (callId) {
      SocketManager.getInstance().emit('call.rejected', { callId, reason: 'declined' });
    }
    if (conversationId) {
      const label = callType === 'video' ? 'Missed video call' : 'Missed voice call';
      apiClient.post(ENDPOINTS.CHAT.SEND(conversationId), { content: label, type: 'missed_call' }).catch(() => {});
    }
    navigation.goBack();
  };

  const handleAccept = () => {
    SocketManager.getInstance().emit('call.answered', { callId });
    const params: any = { ...route?.params, isInitiator: false };
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
            <View style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
              {callerAvatar ? (
                <ImageBackground
                  source={{ uri: callerAvatar }}
                  style={[styles.avatarImage, { width: avatarSize, height: avatarSize }]}
                  imageStyle={[styles.avatarImageInner, { borderRadius: avatarSize / 2 }]}
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
              <View style={[styles.actionIcon, { backgroundColor: colors.error, width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]}>
                <Text style={styles.actionIconText}>✕</Text>
              </View>
              <Text style={styles.actionLabel}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept} activeOpacity={0.8}>
              <View style={[styles.actionIcon, { backgroundColor: colors.success, width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]}>
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
    backgroundColor: colors.gray600,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
  },
  avatarImageInner: {
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

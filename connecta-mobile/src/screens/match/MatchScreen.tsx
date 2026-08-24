import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface MatchScreenProps {
  navigation?: any;
  route?: {
    params?: {
      matchedUser?: {
        userId: string;
        fullName: string;
        avatar?: string;
      };
      conversationId?: string;
    };
  };
}

const MatchScreen: React.FC<MatchScreenProps> = ({ navigation, route }) => {
  const { matchedUser, conversationId } = route?.params || {};
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSendMessage = () => {
    navigation.navigate('Conversation', {
      conversationId,
      otherUserId: matchedUser?.userId || '',
      otherName: matchedUser?.fullName || 'Unknown',
      otherAvatar: matchedUser?.avatar,
    });
  };

  const handleKeepSwiping = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.Text
          style={[
            styles.matchTitle,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          It's a Match!
        </Animated.Text>

        <View style={styles.avatarsContainer}>
          <View style={[styles.avatar, styles.avatarLeft]}>
            <Text style={styles.avatarPlaceholder}>
              {matchedUser?.fullName?.charAt(0) || '?'}
            </Text>
          </View>
          <View style={[styles.avatar, styles.avatarRight]}>
            <Text style={styles.avatarPlaceholder}>You</Text>
          </View>
        </View>

        <Animated.View style={[styles.messageContainer, { opacity: fadeInAnim }]}>
          <Text style={styles.matchMessage}>
            You and {matchedUser?.fullName || 'someone'} liked each other
          </Text>
        </Animated.View>

        <Animated.View style={[styles.buttonsContainer, { opacity: fadeInAnim }]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSendMessage}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Send Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleKeepSwiping}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Keep Swiping</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  matchTitle: {
    ...typography.h1,
    fontSize: 36,
    color: colors.white,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    height: 120,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLeft: {
    zIndex: 1,
  },
  avatarRight: {
    marginLeft: -20,
    zIndex: 2,
  },
  avatarPlaceholder: {
    ...typography.h2,
    color: colors.white,
  },
  messageContainer: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  matchMessage: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: borderRadius.button,
    borderWidth: 2,
    borderColor: colors.white,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

export default MatchScreen;

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { logger } from '../../utils/logger';
import { CompatibilityScore } from '../../components/dating/CompatibilityScore';

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
  const { width: screenWidth } = useWindowDimensions();
  const avatarSize = Math.min(100, screenWidth * 0.25);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const [compatibility, setCompatibility] = useState<any>(null);
  const [icebreakers, setIcebreakers] = useState<any[]>([]);

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

    if (matchedUser?.userId) {
      apiClient
        .get(ENDPOINTS.MATCHING.COMPATIBILITY(matchedUser.userId))
        .then((res: any) => {
          const data = res?.data || res;
          setCompatibility(data);
          setIcebreakers(data?.icebreakers || []);
        })
        .catch((err) => {
          logger.warn('Failed to fetch compatibility', {
            message: err instanceof Error ? err.message : String(err),
          });
        });
    }
  }, [matchedUser?.userId]);

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
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.Text style={[styles.matchTitle, { transform: [{ scale: scaleAnim }] }]}>
          It's a Match!
        </Animated.Text>

        <View style={styles.avatarsContainer}>
          <View
            style={[
              styles.avatar,
              { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
              styles.avatarLeft,
            ]}
          >
            <Text style={styles.avatarPlaceholder}>{matchedUser?.fullName?.charAt(0) || '?'}</Text>
          </View>
          <View
            style={[
              styles.avatar,
              { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
              styles.avatarRight,
            ]}
          >
            <Text style={styles.avatarPlaceholder}>You</Text>
          </View>
        </View>

        <Animated.View style={[styles.messageContainer, { opacity: fadeInAnim }]}>
          <Text style={styles.matchMessage}>
            You and {matchedUser?.fullName || 'someone'} liked each other
          </Text>
        </Animated.View>

        {compatibility && (
          <Animated.View style={[styles.compatibilityContainer, { opacity: fadeInAnim }]}>
            <CompatibilityScore score={compatibility.compatibility || 0} size="large" />
            <Text style={styles.compatibilityLabel}>Compatibility</Text>
            {compatibility.insights?.slice(0, 2).map((insight: string, i: number) => (
              <Text key={i} style={styles.insight}>
                {insight}
              </Text>
            ))}
          </Animated.View>
        )}

        {icebreakers.length > 0 && (
          <Animated.View style={[styles.icebreakersContainer, { opacity: fadeInAnim }]}>
            <Text style={styles.icebreakersTitle}>Conversation Starters</Text>
            {icebreakers.slice(0, 3).map((ib: any, i: number) => (
              <TouchableOpacity
                key={i}
                style={styles.icebreakerBubble}
                onPress={() => {
                  navigation.navigate('Conversation', {
                    conversationId,
                    otherUserId: matchedUser?.userId || '',
                    otherName: matchedUser?.fullName || 'Unknown',
                    otherAvatar: matchedUser?.avatar,
                    initialMessage: ib.text,
                  });
                }}
              >
                <Text style={styles.icebreakerText}>{ib.text}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

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
      </ScrollView>
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
    color: colors.white,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
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
  compatibilityContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  compatibilityLabel: {
    ...typography.caption,
    color: colors.white,
    marginTop: spacing.xs,
    opacity: 0.8,
  },
  insight: {
    ...typography.caption,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  icebreakersContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  icebreakersTitle: {
    ...typography.caption,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
    opacity: 0.8,
  },
  icebreakerBubble: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  icebreakerText: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
  },
});

export default MatchScreen;

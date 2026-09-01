import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { Profile } from '../../types/match';
import { impactMedium } from '../../utils/haptics';
import { InterestTag } from './InterestTag';
import { CompatibilityScore } from './CompatibilityScore';

interface SwipeableCardProps {
  profile: Profile;
  compatibilityScore?: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSuperLike?: () => void;
  onUndo?: () => void;
  style?: any;
}

const calculateAge = (dateOfBirth: string): number => {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  profile,
  compatibilityScore,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  onUndo,
  style,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const SWIPE_THRESHOLD = screenWidth * 0.3;

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        runOnJS(impactMedium)();
        translateX.value = withSpring(screenWidth * 1.5);
        runOnJS(onSwipeRight)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        runOnJS(impactMedium)();
        translateX.value = withSpring(-screenWidth * 1.5);
        runOnJS(onSwipeLeft)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${(translateX.value / screenWidth) * 15}deg` },
    ],
  }));

  const primaryPhoto = profile.photos.find((p) => p.isPrimary) || profile.photos[0];
  const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null;

  return (
    <View style={[styles.wrapper, style]}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          {primaryPhoto && <Image source={{ uri: primaryPhoto.url }} style={styles.image} />}
          {!primaryPhoto && (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="person" size={80} color={colors.gray400} />
            </View>
          )}
          <View style={styles.info}>
            <View style={styles.topRow}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>
                  {profile.firstName}
                  {age ? `, ${age}` : ''}
                </Text>
                {profile.verified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colors.primary}
                    style={{ marginLeft: 4 }}
                  />
                )}
                {profile.city && <Text style={styles.city}> | {profile.city}</Text>}
              </View>
              {typeof compatibilityScore === 'number' && (
                <View style={styles.scoreContainer}>
                  <CompatibilityScore score={compatibilityScore} />
                  <Text style={styles.scoreLabel}>Match</Text>
                </View>
              )}
            </View>
            {profile.bio ? (
              <Text style={styles.bio} numberOfLines={2}>
                {profile.bio}
              </Text>
            ) : null}
            {profile.interests && profile.interests.length > 0 && (
              <View style={styles.interestsRow}>
                {profile.interests.slice(0, 4).map((interest, i) => (
                  <InterestTag key={i} label={interest.name} />
                ))}
                {profile.interests.length > 4 && (
                  <Text style={styles.moreInterests}>+{profile.interests.length - 4}</Text>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.undoButton]}
          onPress={onUndo}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-undo" size={22} color={colors.warning} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={onSwipeLeft}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color={colors.error} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={onSuperLike}
          activeOpacity={0.7}
        >
          <Ionicons name="star" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={onSwipeRight}
          activeOpacity={0.7}
        >
          <Ionicons name="heart" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  card: {
    flex: 1,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: { ...StyleSheet.absoluteFill, width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  name: { ...typography.h3, color: colors.white },
  city: { ...typography.body, color: 'rgba(255,255,255,0.8)' },
  bio: { ...typography.caption, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.xs },
  interestsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  moreInterests: { ...typography.small, color: colors.whiteOverlaySoft, alignSelf: 'center' },
  scoreContainer: { alignItems: 'center' },
  scoreLabel: { ...typography.small, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  undoButton: {
    borderColor: colors.warning,
  },
  passButton: {
    borderColor: colors.error,
  },
  superLikeButton: {
    borderColor: colors.primary,
  },
  likeButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
});

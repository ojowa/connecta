import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
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
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

const calculateAge = (dateOfBirth: string): number => {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export const SwipeableCard: React.FC<SwipeableCardProps> = ({ profile, onSwipeLeft, onSwipeRight }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        impactMedium();
        translateX.value = withSpring(SCREEN_WIDTH * 1.5);
        onSwipeRight();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        impactMedium();
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5);
        onSwipeLeft();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { rotate: `${(translateX.value / SCREEN_WIDTH) * 15}deg` }],
  }));

  const primaryPhoto = profile.photos.find(p => p.isPrimary) || profile.photos[0];
  const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null;
  const compatibilityScore = (profile as any).compatibilityScore;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {primaryPhoto && <Image source={{ uri: primaryPhoto.url }} style={styles.image} />}
        <View style={styles.info}>
          <View style={styles.topRow}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{profile.firstName}{age ? `, ${age}` : ''}</Text>
              {profile.city && <Text style={styles.city}> | {profile.city}</Text>}
            </View>
            {typeof compatibilityScore === 'number' && (
              <CompatibilityScore score={compatibilityScore} />
            )}
          </View>
          {profile.bio ? (
            <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
          ) : null}
          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.interestsRow}>
              {profile.interests.slice(0, 4).map((interest, i) => (
                <InterestTag key={i} label={interest} />
              ))}
              {profile.interests.length > 4 && (
                <Text style={styles.moreInterests}>+{profile.interests.length - 4}</Text>
              )}
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: { width: SCREEN_WIDTH - 32, height: SCREEN_WIDTH * 1.2, borderRadius: borderRadius.card, overflow: 'hidden', backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  info: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.md, backgroundColor: colors.overlayHeavy },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.xs },
  nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  name: { ...typography.h3, color: colors.white },
  city: { ...typography.body, color: 'rgba(255,255,255,0.8)' },
  bio: { ...typography.caption, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.xs },
  interestsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  moreInterests: { ...typography.small, color: colors.whiteOverlaySoft, alignSelf: 'center' },
});

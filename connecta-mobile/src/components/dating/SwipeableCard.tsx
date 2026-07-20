import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Profile } from '../../types/match';

interface SwipeableCardProps {
  profile: Profile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

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
        translateX.value = withSpring(SCREEN_WIDTH * 1.5);
        onSwipeRight();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
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

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {primaryPhoto && <Image source={{ uri: primaryPhoto.url }} style={styles.image} />}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <View style={[styles.onlineDot]} />
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: { width: SCREEN_WIDTH - 32, height: SCREEN_WIDTH * 1.2, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  info: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(0,0,0,0.6)' },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success },
});

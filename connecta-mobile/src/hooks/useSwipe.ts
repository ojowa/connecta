import { useRef, useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { animations } from '../theme/animations';

export function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  const triggerSwipeRight = useCallback(() => {
    'worklet';
    translateX.value = withSpring(500, { damping: 20, stiffness: 200 });
    runOnJS(onSwipeRight)();
  }, [onSwipeRight]);

  const triggerSwipeLeft = useCallback(() => {
    'worklet';
    translateX.value = withSpring(-500, { damping: 20, stiffness: 200 });
    runOnJS(onSwipeLeft)();
  }, [onSwipeLeft]);

  const resetPosition = useCallback(() => {
    'worklet';
    translateX.value = withSpring(0, animations.spring);
    translateY.value = withSpring(0, animations.spring);
    rotate.value = withSpring(0, animations.spring);
  }, []);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.3;
      rotate.value = (event.translationX / 300) * 15;
    })
    .onEnd((event) => {
      if (event.translationX > 120) {
        triggerSwipeRight();
      } else if (event.translationX < -120) {
        triggerSwipeLeft();
      } else {
        resetPosition();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return { panGesture, animatedStyle, translateX };
}

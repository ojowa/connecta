import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Text } from '../../components/common';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  color: string;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Discover People',
    subtitle: 'Swipe through profiles of people near you',
    color: colors.primary,
  },
  {
    id: 2,
    title: 'Match & Connect',
    subtitle: 'When you both like each other, it\'s a match!',
    color: colors.secondary,
  },
  {
    id: 3,
    title: 'Chat Safely',
    subtitle: 'End-to-end encrypted messaging keeps your conversations private',
    color: colors.success,
  },
];

const OnboardingFlow: React.FC = () => {
  const navigation = useNavigation<any>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const handleNext = () => {
    if (currentPage < steps.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentPage + 1) * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {steps.map((step) => (
          <View key={step.id} style={styles.page}>
            <View style={styles.iconContainer}>
              <View style={[styles.circle, { backgroundColor: step.color }]}>
                <View style={styles.circleInner}>
                  <View style={[styles.dot, { backgroundColor: colors.white }]} />
                  <View style={[styles.dot, { backgroundColor: colors.white }]} />
                  <View style={[styles.dot, { backgroundColor: colors.white }]} />
                </View>
              </View>
            </View>
            <View style={styles.textContainer}>
              <Text variant="h2" style={styles.title}>
                {step.title}
              </Text>
              <Text variant="body" style={styles.subtitle}>
                {step.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dotIndicator,
                index === currentPage && styles.activeDot,
                index === currentPage && { backgroundColor: steps[currentPage].color },
              ]}
            />
          ))}
        </View>
        <Button
          title={currentPage === steps.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          size="large"
          style={[styles.button, { backgroundColor: steps[currentPage].color }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xxl,
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleInner: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray200,
  },
  activeDot: {
    width: 24,
    borderRadius: borderRadius.button,
  },
  button: {
    width: '100%',
    borderRadius: borderRadius.button,
  },
});

export default OnboardingFlow;

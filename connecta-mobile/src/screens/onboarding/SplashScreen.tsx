import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Text } from '../../components/common';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <View style={styles.heart}>
              <View style={[styles.heartHalf, styles.heartLeft]} />
              <View style={[styles.heartHalf, styles.heartRight]} />
            </View>
          </View>
          <Text variant="h1" style={styles.logoText}>
            Connecta
          </Text>
        </View>
        <Text variant="body" style={styles.tagline}>
          Find Your Connection
        </Text>
      </View>
      <View style={styles.bottom}>
        <LoadingSpinner size="small" color={colors.white} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartHalf: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  heartLeft: {
    transform: [{ rotate: '-45deg' }, { translateX: 4 }],
  },
  heartRight: {
    transform: [{ rotate: '45deg' }, { translateX: -4 }],
  },
  logoText: {
    color: colors.white,
    fontSize: 36,
    fontWeight: '700',
  },
  tagline: {
    color: colors.white,
    marginTop: spacing.md,
    opacity: 0.9,
  },
  bottom: {
    position: 'absolute',
    bottom: spacing.xxl,
  },
});

export default SplashScreen;

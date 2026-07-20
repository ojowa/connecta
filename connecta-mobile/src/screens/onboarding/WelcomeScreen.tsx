import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button, Text } from '../../components/common';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.content}>
        <View style={styles.heroArea}>
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
        </View>

        <View style={styles.textArea}>
          <Text variant="h1" style={styles.heading}>
            Welcome to Connecta
          </Text>
          <Text variant="body" style={styles.subtitle}>
            Join millions finding meaningful connections
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Get Started"
            onPress={() => navigation.navigate('Register')}
            size="large"
            style={styles.getStartedButton}
          />
          <View style={styles.loginRow}>
            <Text variant="body" style={styles.loginText}>
              Already have an account?{' '}
            </Text>
            <Text
              variant="body"
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              Log In
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  heroArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartHalf: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  heartLeft: {
    transform: [{ rotate: '-45deg' }, { translateX: 6 }],
  },
  heartRight: {
    transform: [{ rotate: '45deg' }, { translateX: -6 }],
  },
  logoText: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: '700',
  },
  textArea: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  heading: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    alignItems: 'center',
  },
  getStartedButton: {
    width: '100%',
    marginBottom: spacing.lg,
    borderRadius: borderRadius.button,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    color: colors.textSecondary,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default WelcomeScreen;

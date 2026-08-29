import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { usePlanInfo } from '../../hooks/useMatch';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface ActiveBoost {
  id: string;
  activatedAt: string;
  expiresAt: string;
  viewsGained: number;
  likesGained: number;
}

interface BoostData {
  activeBoost: ActiveBoost | null;
  totalBoosts: number;
}

function formatCountdown(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return '00:00';
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function BoostScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const queryClient = useQueryClient();
  const [countdown, setCountdown] = useState('00:00');
  const appState = useRef(AppState.currentState);
  const { data: planInfo, refetch: refetchPlan } = usePlanInfo();
  const isPremium = planInfo?.isPremium;

  const { data: boostData, isLoading } = useQuery({
    queryKey: ['boost'],
    queryFn: () => apiClient.get('/matching/boost').then((r) => r.data as BoostData),
    refetchInterval: 30000,
  });

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        refetchPlan();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [refetchPlan]);

  useEffect(() => {
    const unsub = navigation?.addListener?.('focus', () => {
      refetchPlan();
    });
    return unsub;
  }, [navigation, refetchPlan]);

  const activateMutation = useMutation({
    mutationFn: async () => {
      const latestPlan = await refetchPlan();
      if (!latestPlan.data?.isPremium) {
        throw new Error('NOT_PREMIUM');
      }
      return apiClient.post('/matching/boost');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boost'] });
      Alert.alert('Boost Activated!', 'Your profile is now boosted for 30 minutes.');
    },
    onError: (error: any) => {
      if (error?.message === 'NOT_PREMIUM') {
        Alert.alert(
          'Premium Required',
          'Your subscription may have expired. Please renew to use Boost.',
          [{ text: 'OK' }],
        );
        refetchPlan();
      } else {
        Alert.alert('Error', 'Failed to activate boost. Please try again.');
      }
    },
  });

  useEffect(() => {
    if (!boostData?.activeBoost) {
      setCountdown('00:00');
      return;
    }
    const update = () => setCountdown(formatCountdown(boostData.activeBoost!.expiresAt));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [boostData?.activeBoost]);

  const handleActivate = () => {
    if (!isPremium) {
      navigation.navigate('Subscription');
      return;
    }
    Alert.alert('Activate Boost', 'This will boost your profile for 30 minutes.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Activate', onPress: () => activateMutation.mutate() },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom' as any]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const activeBoost = boostData?.activeBoost;
  const isActive = activeBoost && new Date(activeBoost.expiresAt).getTime() > Date.now();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom' as any]}>
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.icon}>⚡</Text>
          <Text style={styles.title}>Profile Boost</Text>
          <Text style={styles.subtitle}>
            {isActive
              ? 'Your profile is currently boosted! You appear at the top of the feed.'
              : 'Boost your profile to appear at the top of the feed for 30 minutes.'}
          </Text>
        </View>

        {isActive && (
          <View style={styles.countdownCard}>
            <Text style={styles.countdownLabel}>Time Remaining</Text>
            <Text style={styles.countdownTimer}>{countdown}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(
                      0,
                      (new Date(activeBoost!.expiresAt).getTime() - Date.now()) / (30 * 60 * 1000) * 100
                    )}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeBoost?.viewsGained ?? 0}</Text>
            <Text style={styles.statLabel}>Views Gained</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeBoost?.likesGained ?? 0}</Text>
            <Text style={styles.statLabel}>Likes Gained</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Total Boosts Used</Text>
          <Text style={styles.infoValue}>{boostData?.totalBoosts ?? 0}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.boostButton,
            (isActive || activateMutation.isPending) && styles.boostButtonDisabled,
          ]}
          onPress={handleActivate}
          disabled={!!isActive || activateMutation.isPending}
          activeOpacity={0.7}
        >
          <Text style={styles.boostButtonText}>
            {activateMutation.isPending
              ? 'Activating...'
              : isActive
              ? 'Boost Active'
              : !isPremium
              ? 'Upgrade to Boost'
              : '⚡ Activate Boost'}
          </Text>
        </TouchableOpacity>

        {!isPremium && (
          <TouchableOpacity
            style={styles.upgradeLink}
            onPress={() => navigation.navigate('Subscription')}
          >
            <Text style={styles.upgradeText}>View Plans</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  countdownCard: {
    backgroundColor: colors.primaryOverlay,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  countdownLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  countdownTimer: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  statsSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  infoTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  infoValue: {
    ...typography.h3,
    color: colors.primary,
  },
  boostButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
    alignItems: 'center',
  },
  boostButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  boostButtonText: {
    ...typography.button,
    color: colors.white,
  },
  upgradeLink: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  upgradeText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});

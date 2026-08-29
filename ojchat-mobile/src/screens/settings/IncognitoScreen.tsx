import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { usePlanInfo } from '../../hooks/useMatch';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

export default function IncognitoScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const appState = useRef(AppState.currentState);
  const { data: planInfo, refetch: refetchPlan } = usePlanInfo();
  const isPremium = planInfo?.isPremium;

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.get('/users/me').then((r) => r.data),
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

  const toggleMutation = useMutation({
    mutationFn: async () => {
      const latestPlan = await refetchPlan();
      if (!latestPlan.data?.isPremium) {
        throw new Error('NOT_PREMIUM');
      }
      return apiClient.post('/matching/incognito/toggle');
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      const newStatus = response.data?.incognito ?? response.data?.incognitoMode;
      Alert.alert(
        'Incognito Mode',
        newStatus ? 'You are now incognito. You won\'t appear in anyone\'s feed.' : 'Incognito mode disabled. You\'re back in the feed.'
      );
    },
    onError: (error: any) => {
      if (error?.message === 'NOT_PREMIUM') {
        Alert.alert(
          'Premium Required',
          'Your subscription may have expired. Please renew to use Incognito Mode.',
          [{ text: 'OK' }],
        );
        refetchPlan();
      } else {
        Alert.alert('Error', 'Failed to toggle incognito mode.');
      }
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom' as any]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const isIncognito = me?.incognito ?? me?.incognitoMode ?? false;

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom' as any]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Incognito Mode</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Text style={{ fontSize: 56, marginBottom: spacing.md }}>🕵️</Text>
          <Text style={typography.h2}>Premium Feature</Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xl }]}>
            Upgrade to Premium to use Incognito Mode and browse profiles privately.
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => navigation.navigate('Subscription')}
            activeOpacity={0.7}
          >
            <Ionicons name="diamond" size={20} color={colors.white} />
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom' as any]}>
      <View style={styles.content}>
        <View style={styles.iconSection}>
          <Text style={styles.icon}>🕵️</Text>
          <Text style={styles.title}>Incognito Mode</Text>
        </View>

        <View style={styles.toggleSection}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Incognito Mode</Text>
              <Text style={styles.toggleDescription}>
                When incognito, you won't appear in anyone's feed
              </Text>
            </View>
            <Switch
              value={isIncognito}
              onValueChange={() => toggleMutation.mutate()}
              disabled={toggleMutation.isPending}
              trackColor={{ false: colors.gray300, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          {toggleMutation.isPending && (
            <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoHeading}>How it works</Text>
          <View style={styles.infoRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              Your profile won't show up in the discovery feed
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              You won't appear in anyone's "Suggested" or "Top Picks"
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              Existing matches and conversations are unaffected
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              You can still like and message people you've matched with
            </Text>
          </View>
        </View>

        {isIncognito && (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>
              Incognito mode is currently active. Toggle off to reappear in feeds.
            </Text>
          </View>
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
  iconSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  icon: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  toggleSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  toggleDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  spinner: {
    marginTop: spacing.sm,
  },
  infoSection: {
    marginBottom: spacing.xl,
  },
  infoHeading: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  bullet: {
    ...typography.body,
    color: colors.primary,
    marginRight: spacing.sm,
    width: 20,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: colors.primaryOverlay,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  statusText: {
    ...typography.body,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
  },
  upgradeButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

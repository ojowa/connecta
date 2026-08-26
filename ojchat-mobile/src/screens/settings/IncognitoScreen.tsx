import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

export default function IncognitoScreen() {
  const queryClient = useQueryClient();

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.get('/users/me').then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: () => apiClient.post('/matching/incognito/toggle'),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      const newStatus = response.data?.incognito ?? response.data?.incognitoMode;
      Alert.alert(
        'Incognito Mode',
        newStatus ? 'You are now incognito. You won\'t appear in anyone\'s feed.' : 'Incognito mode disabled. You\'re back in the feed.'
      );
    },
    onError: () => Alert.alert('Error', 'Failed to toggle incognito mode.'),
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
});

import React from 'react';
import { View, Text, StyleSheet, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function TwoFactorAuthScreen() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['twoFactorSettings'],
    queryFn: () => apiClient.get('/auth/2fa/settings').then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (enabled: boolean) => apiClient.post('/auth/2fa/toggle', { enabled, method: 'sms' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twoFactorSettings'] });
      Alert.alert('Updated', 'Two-factor authentication settings saved.');
    },
    onError: () => Alert.alert('Error', 'Failed to update 2FA settings.'),
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>SMS Authentication</Text>
            <Text style={styles.rowDescription}>Receive a code via text message when signing in</Text>
          </View>
          <Switch
            value={settings?.enabled ?? false}
            onValueChange={(v) => toggleMutation.mutate(v)}
            trackColor={{ false: colors.gray300, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>Authenticator App</Text>
            <Text style={styles.rowDescription}>Use an authenticator app like Google Authenticator</Text>
          </View>
          <Switch
            value={false}
            onValueChange={() => Alert.alert('Coming Soon', 'Authenticator app setup will be available soon.')}
            trackColor={{ false: colors.gray300, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  rowInfo: { flex: 1, marginRight: spacing.md },
  rowLabel: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  rowDescription: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

const START_OPTIONS = [20, 21, 22, 23];
const END_OPTIONS = [6, 7, 8, 9];

function timeToString(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

function stringToHour(time: string | null): number | null {
  if (!time) return null;
  const h = parseInt(time.split(':')[0], 10);
  return isNaN(h) ? null : h;
}

export default function QuietHoursScreen() {
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(false);
  const [startHour, setStartHour] = useState(22);
  const [endHour, setEndHour] = useState(8);

  const { data: prefs, isLoading } = useQuery({
    queryKey: ['notificationPrefs'],
    queryFn: () => apiClient.get(ENDPOINTS.NOTIFICATIONS.PREFERENCES).then((r) => r.data),
  });

  useEffect(() => {
    if (prefs) {
      const s = stringToHour(prefs.quietHoursStart);
      const e = stringToHour(prefs.quietHoursEnd);
      const isOn = s !== null && e !== null;
      setEnabled(isOn);
      if (s !== null) setStartHour(s);
      if (e !== null) setEndHour(e);
    }
  }, [prefs]);

  const saveMutation = useMutation({
    mutationFn: (p: any) => apiClient.put(ENDPOINTS.NOTIFICATIONS.PREFERENCES, p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificationPrefs'] }),
    onError: () => Alert.alert('Error', 'Failed to save quiet hours.'),
  });

  const handleToggle = (v: boolean) => {
    setEnabled(v);
    if (!v) {
      saveMutation.mutate({ quietHoursStart: null, quietHoursEnd: null });
    } else {
      saveMutation.mutate({
        quietHoursStart: timeToString(startHour),
        quietHoursEnd: timeToString(endHour),
      });
    }
  };

  const handleStartChange = (h: number) => {
    setStartHour(h);
    if (enabled) {
      saveMutation.mutate({
        quietHoursStart: timeToString(h),
        quietHoursEnd: timeToString(endHour),
      });
    }
  };

  const handleEndChange = (h: number) => {
    setEndHour(h);
    if (enabled) {
      saveMutation.mutate({
        quietHoursStart: timeToString(startHour),
        quietHoursEnd: timeToString(h),
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>Enable Quiet Hours</Text>
            <Text style={styles.rowDescription}>Silence notifications during set hours</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            trackColor={{ false: colors.gray300, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>Start</Text>
          <View style={styles.timeButtons}>
            {START_OPTIONS.map((h) => (
              <View
                key={h}
                style={[styles.timeButton, startHour === h && styles.timeButtonActive]}
                onTouchEnd={() => handleStartChange(h)}
              >
                <Text
                  style={[styles.timeButtonText, startHour === h && styles.timeButtonTextActive]}
                >
                  {h}:00
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>End</Text>
          <View style={styles.timeButtons}>
            {END_OPTIONS.map((h) => (
              <View
                key={h}
                style={[styles.timeButton, endHour === h && styles.timeButtonActive]}
                onTouchEnd={() => handleEndChange(h)}
              >
                <Text style={[styles.timeButtonText, endHour === h && styles.timeButtonTextActive]}>
                  {h}:00
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.hint}>
          During quiet hours, you won't receive push notifications or sound alerts. Messages will
          still be delivered silently.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  rowInfo: { flex: 1, marginRight: spacing.md },
  rowLabel: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  rowDescription: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  timeRow: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  timeLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  timeButtons: { flexDirection: 'row', gap: spacing.sm },
  timeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.input,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeButtonText: { ...typography.body, color: colors.textPrimary },
  timeButtonTextActive: { color: colors.white },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xl,
    lineHeight: 20,
  },
});

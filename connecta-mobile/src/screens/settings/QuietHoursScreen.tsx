import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

export default function QuietHoursScreen() {
  const [enabled, setEnabled] = useState(false);
  const [startHour, setStartHour] = useState(22);
  const [endHour, setEndHour] = useState(8);

  const handleToggle = (v: boolean) => {
    setEnabled(v);
    if (v) {
      Alert.alert('Quiet Hours', `Notifications will be silenced from ${startHour}:00 to ${endHour}:00.`);
    }
  };

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
            {[20, 21, 22, 23].map((h) => (
              <View key={h} style={[styles.timeButton, startHour === h && styles.timeButtonActive]} onTouchEnd={() => setStartHour(h)}>
                <Text style={[styles.timeButtonText, startHour === h && styles.timeButtonTextActive]}>{h}:00</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>End</Text>
          <View style={styles.timeButtons}>
            {[6, 7, 8, 9].map((h) => (
              <View key={h} style={[styles.timeButton, endHour === h && styles.timeButtonActive]} onTouchEnd={() => setEndHour(h)}>
                <Text style={[styles.timeButtonText, endHour === h && styles.timeButtonTextActive]}>{h}:00</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.hint}>During quiet hours, you won't receive push notifications or sound alerts. Messages will still be delivered silently.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  content: { padding: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  rowInfo: { flex: 1, marginRight: spacing.md },
  rowLabel: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  rowDescription: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  timeRow: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  timeLabel: { ...typography.body, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm },
  timeButtons: { flexDirection: 'row', gap: spacing.sm },
  timeButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.input, borderWidth: 1, borderColor: colors.border },
  timeButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeButtonText: { ...typography.body, color: colors.textPrimary },
  timeButtonTextActive: { color: colors.white },
  hint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xl, lineHeight: 20 },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { apiClient } from '../../services/api/apiClient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

const APPEAL_REASONS = [
  'I was wrongly banned',
  'My account was hacked',
  'This was a misunderstanding',
  'I have changed my behavior',
  'The ban was too harsh',
  'Other',
];

interface AppealScreenProps { navigation: any; }

export default function AppealScreen({ navigation }: AppealScreenProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingAppeal, setExistingAppeal] = useState<any>(null);
  const [checkingAppeal, setCheckingAppeal] = useState(true);

  useEffect(() => {
    checkExistingAppeal();
  }, []);

  const checkExistingAppeal = async () => {
    try {
      const response = await apiClient.get('/users/me/appeals');
      const appeals = response.data?.appeals || [];
      const pending = appeals.find((a: any) => a.status === 'pending');
      setExistingAppeal(pending || null);
    } catch {
    } finally {
      setCheckingAppeal(false);
    }
  };

  const handleSubmit = async () => {
    if (!reason) {
      Alert.alert('Required', 'Please select a reason for your appeal.');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/users/me/appeal', { reason, description });
      Alert.alert('Submitted', 'Your appeal has been submitted. Our team will review it shortly.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to submit appeal.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAppeal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (existingAppeal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Appeal Submitted</Text>
          <Text style={styles.subtitle}>Your appeal is being reviewed by our team.</Text>

          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={styles.statusValue}>{existingAppeal.status}</Text>
            <Text style={styles.statusDetail}>Reason: {existingAppeal.reason}</Text>
            <Text style={styles.statusDetail}>Submitted: {new Date(existingAppeal.createdAt).toLocaleDateString()}</Text>
          </View>

          {existingAppeal.decision && (
            <View style={[styles.statusCard, existingAppeal.decision === 'approved' ? styles.approvedCard : styles.rejectedCard]}>
              <Text style={styles.statusLabel}>Decision</Text>
              <Text style={[styles.statusValue, existingAppeal.decision === 'approved' ? styles.approvedText : styles.rejectedText]}>
                {existingAppeal.decision}
              </Text>
              {existingAppeal.decisionNotes && (
                <Text style={styles.statusDetail}>{existingAppeal.decisionNotes}</Text>
              )}
            </View>
          )}

          <Button title="Go Back" onPress={() => navigation.goBack()} style={styles.backButton} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Submit an Appeal</Text>
        <Text style={styles.subtitle}>
          Your account has been suspended or banned. If you believe this was a mistake, you can submit an appeal for review.
        </Text>

        <Text style={styles.label}>Reason for appeal *</Text>
        {APPEAL_REASONS.map((r) => (
          <View key={r} style={styles.radioRow}>
            <View style={[styles.radio, reason === r && styles.radioSelected]} />
            <Text style={styles.radioLabel} onPress={() => setReason(r)}>{r}</Text>
          </View>
        ))}

        <Text style={styles.label}>Additional details (optional)</Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          placeholder="Provide any additional context for your appeal..."
          multiline
          numberOfLines={4}
          maxLength={1000}
          placeholderTextColor={colors.gray400}
        />
        <Text style={styles.charCount}>{description.length}/1000</Text>

        <Button title="Submit Appeal" onPress={handleSubmit} loading={loading} style={styles.submitButton} />
        <Button title="Cancel" variant="ghost" onPress={() => navigation.goBack()} style={styles.cancelButton} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...typography.body, color: colors.textSecondary },
  container: { padding: spacing.xl, paddingBottom: spacing.xxl },
  title: { ...typography.h1, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  statusCard: { padding: spacing.lg, backgroundColor: colors.gray50, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.gray200, marginBottom: spacing.lg },
  approvedCard: { borderColor: colors.success, backgroundColor: '#f0fdf4' },
  rejectedCard: { borderColor: colors.error, backgroundColor: '#fef2f2' },
  statusLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  statusValue: { ...typography.h3, color: colors.textPrimary, textTransform: 'capitalize', marginBottom: spacing.sm },
  statusDetail: { ...typography.caption, color: colors.textSecondary },
  approvedText: { color: colors.success },
  rejectedText: { color: colors.error },
  label: { ...typography.body, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.md },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.gray300, marginRight: spacing.md },
  radioSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  radioLabel: { ...typography.body, color: colors.textPrimary },
  textArea: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, minHeight: 100, textAlignVertical: 'top', ...typography.body, color: colors.textPrimary },
  charCount: { ...typography.caption, color: colors.textSecondary, textAlign: 'right', marginTop: spacing.xs },
  submitButton: { marginTop: spacing.xl },
  cancelButton: { marginTop: spacing.sm },
  backButton: { marginTop: spacing.xl },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

const CATEGORIES = ['Bug report', 'Feature request', 'Safety concern', 'Account issue', 'Payment issue', 'Other'] as const;
type Category = (typeof CATEGORIES)[number];

export default function ReportProblemScreen({ navigation }: any) {
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!category || !description.trim()) return;
    setLoading(true);
    try {
      await apiClient.post(ENDPOINTS.SUPPORT.REPORT, { category, description: description.trim() });
      Alert.alert('Thank you', 'Your report has been submitted. We will look into it.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Category</Text>
        {CATEGORIES.map((cat) => (
          <View key={cat} style={[styles.option, category === cat && styles.optionSelected]} onTouchEnd={() => setCategory(cat)}>
            <View style={[styles.radio, category === cat && styles.radioSelected]}>
              {category === cat && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.optionText}>{cat}</Text>
          </View>
        ))}

        <Text style={styles.sectionLabel}>Description</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Describe the problem in detail..."
          placeholderTextColor={colors.gray400}
          value={description}
          onChangeText={(t) => { if (t.length <= 1000) setDescription(t); }}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{description.length}/1000</Text>

        <Button
          title={loading ? 'Submitting...' : 'Submit Report'}
          onPress={handleSubmit}
          disabled={!category || !description.trim() || loading}
        />
        {loading && <ActivityIndicator style={styles.loader} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  content: { padding: spacing.lg },
  sectionLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.md },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.input, marginBottom: spacing.sm },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryOverlay },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.gray300, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  radioSelected: { borderColor: colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  optionText: { ...typography.body, color: colors.textPrimary },
  textInput: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.input, padding: spacing.md, ...typography.body, color: colors.textPrimary, minHeight: 120, marginTop: spacing.sm },
  charCount: { ...typography.small, color: colors.textSecondary, textAlign: 'right', marginTop: spacing.xs, marginBottom: spacing.md },
  loader: { marginTop: spacing.md },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

const REPORT_TYPES = [
  'Fake profile',
  'Inappropriate photos',
  'Harassment',
  'Scam attempt',
  'Underage user',
  'Other',
] as const;

type ReportType = (typeof REPORT_TYPES)[number];

interface ReportScreenProps {
  route?: { params?: { userId: string; userName: string } };
  navigation?: any;
}

const ReportScreen: React.FC<ReportScreenProps> = ({ route, navigation }) => {
  const { userId = '', userName = '' } = route?.params || {};
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) return;
    setLoading(true);
    try {
      await apiClient.post(ENDPOINTS.USERS.REPORT(userId), { reportType: selectedType, description });
      Alert.alert('Thank you for your report', '', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Report {userName}</Text>

        <Text style={styles.sectionLabel}>Select a reason</Text>
        {REPORT_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.option, selectedType === type && styles.optionSelected]}
            onPress={() => setSelectedType(type)}
            activeOpacity={0.7}
          >
            <View style={[styles.radio, selectedType === type && styles.radioSelected]}>
              {selectedType === type && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.optionText}>{type}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionLabel}>Additional details (optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Add more details..."
          placeholderTextColor={colors.gray400}
          value={description}
          onChangeText={(text) => {
            if (text.length <= 500) setDescription(text);
          }}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{description.length}/500</Text>

        <Button
          title={loading ? 'Submitting...' : 'Submit Report'}
          onPress={handleSubmit}
          disabled={!selectedType || loading}
          style={styles.submitButton}
        />
        {loading && <ActivityIndicator style={styles.loader} />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.input,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryOverlay,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.input,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 100,
    marginTop: spacing.sm,
  },
  charCount: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  loader: {
    marginTop: spacing.md,
  },
});

export default ReportScreen;

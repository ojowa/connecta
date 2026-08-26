import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../../services/api/apiClient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface Prompt {
  id: string;
  question: string;
}

interface UserPrompt {
  question: string;
  answer: string;
}

const MAX_SELECTED = 3;

export default function ProfilePromptsScreen() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompts, setSelectedPrompts] = useState<UserPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allPromptsRes, userPromptsRes] = await Promise.all([
        apiClient.get('/users/prompts'),
        apiClient.get('/users/me/prompts'),
      ]);

      setPrompts(allPromptsRes.data?.prompts ?? allPromptsRes.data ?? []);

      const saved: UserPrompt[] = userPromptsRes.data?.prompts ?? userPromptsRes.data ?? [];
      setSelectedPrompts(saved);
    } catch {
      Alert.alert('Error', 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (question: string) =>
    selectedPrompts.some((p) => p.question === question);

  const togglePrompt = (prompt: Prompt) => {
    if (isSelected(prompt.question)) {
      setSelectedPrompts((prev) => prev.filter((p) => p.question !== prompt.question));
    } else {
      if (selectedPrompts.length >= MAX_SELECTED) {
        Alert.alert('Limit reached', `You can select up to ${MAX_SELECTED} prompts`);
        return;
      }
      setSelectedPrompts((prev) => [...prev, { question: prompt.question, answer: '' }]);
    }
  };

  const updateAnswer = (question: string, answer: string) => {
    setSelectedPrompts((prev) =>
      prev.map((p) => (p.question === question ? { ...p, answer } : p))
    );
  };

  const handleSave = async () => {
    const incomplete = selectedPrompts.find((p) => !p.answer.trim());
    if (incomplete) {
      Alert.alert('Incomplete', 'Please answer all selected prompts');
      return;
    }
    setSaving(true);
    try {
      await apiClient.put('/users/me/prompts', { prompts: selectedPrompts });
      Alert.alert('Saved', 'Your prompts have been updated');
    } catch {
      Alert.alert('Error', 'Failed to save prompts');
    } finally {
      setSaving(false);
    }
  };

  const renderPrompt = ({ item }: { item: Prompt }) => {
    const selected = isSelected(item.question);
    const userPrompt = selectedPrompts.find((p) => p.question === item.question);

    return (
      <TouchableOpacity
        style={[styles.card, selected && styles.cardSelected]}
        onPress={() => togglePrompt(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.question}>{item.question}</Text>
          <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
            {selected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>
        {selected && (
          <TextInput
            style={styles.answerInput}
            placeholder="Write your answer..."
            placeholderTextColor={colors.gray400}
            value={userPrompt?.answer ?? ''}
            onChangeText={(text) => updateAnswer(item.question, text)}
            multiline
            maxLength={200}
          />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading prompts..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        <Text style={styles.header}>
          Choose {MAX_SELECTED} prompts to answer on your profile
        </Text>
        <FlatList
          data={prompts}
          keyExtractor={(item) => item.id}
          renderItem={renderPrompt}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Prompts'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, backgroundColor: colors.white },
  header: { ...typography.body, color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.md },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryOverlay,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  question: { ...typography.body, fontWeight: '600', color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: colors.white, fontSize: 14, fontWeight: '700' },
  answerInput: {
    ...typography.body,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.input,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { ...typography.button, color: colors.white },
});

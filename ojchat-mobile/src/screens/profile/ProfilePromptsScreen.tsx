import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { shadows } from '../../theme/shadows';
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
        apiClient.get(ENDPOINTS.USERS.AVAILABLE_PROMPTS),
        apiClient.get(ENDPOINTS.USERS.PROMPTS),
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

  const isSelected = (question: string) => selectedPrompts.some((p) => p.question === question);

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
    setSelectedPrompts((prev) => prev.map((p) => (p.question === question ? { ...p, answer } : p)));
  };

  const handleSave = async () => {
    const incomplete = selectedPrompts.find((p) => !p.answer.trim());
    if (incomplete) {
      Alert.alert('Incomplete', 'Please answer all selected prompts');
      return;
    }
    setSaving(true);
    try {
      await apiClient.put(ENDPOINTS.USERS.PROMPTS, { prompts: selectedPrompts });
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
      <View style={[styles.card, selected && styles.cardSelected]}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => togglePrompt(item)}
          activeOpacity={0.7}
        >
          {/* Accent bar */}
          {selected && <View style={styles.accentBar} />}
          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <Text style={styles.question}>{item.question}</Text>
              <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                {selected && <Ionicons name="checkmark" size={14} color={colors.white} />}
              </View>
            </View>
            {selected && (
              <View style={styles.answerSection}>
                <TextInput
                  style={styles.answerInput}
                  placeholder="Write your answer..."
                  placeholderTextColor={colors.gray400}
                  value={userPrompt?.answer ?? ''}
                  onChangeText={(text) => updateAnswer(item.question, text)}
                  multiline
                  maxLength={200}
                />
                <Text style={styles.answerCharCount}>{(userPrompt?.answer ?? '').length}/200</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading prompts..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Profile Prompts</Text>
          <Text style={styles.headerSubtitle}>
            Choose {MAX_SELECTED} prompts to answer on your profile
          </Text>
          {/* Selected Pills */}
          {selectedPrompts.length > 0 && (
            <View style={styles.selectedPills}>
              {selectedPrompts.map((p, i) => (
                <View key={i} style={styles.pill}>
                  <Text style={styles.pillText} numberOfLines={1}>
                    {p.question.length > 25 ? p.question.slice(0, 25) + '...' : p.question}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <FlatList
          data={prompts}
          keyExtractor={(item) => item.id}
          renderItem={renderPrompt}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={[styles.saveGradient, saving && styles.saveGradientDisabled]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Prompts'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.gray50 },
  container: { flex: 1, backgroundColor: colors.gray50 },

  // Header
  headerSection: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray100,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  selectedPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  pill: {
    backgroundColor: colors.primaryOverlay,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  pillText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },

  // List
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  cardContent: {
    flexDirection: 'row',
  },
  accentBar: {
    width: 4,
    backgroundColor: colors.primary,
  },
  cardBody: {
    flex: 1,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  question: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  // Answer
  answerSection: {
    marginTop: spacing.md,
  },
  answerInput: {
    ...typography.body,
    padding: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.input,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  answerCharCount: {
    ...typography.small,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },

  // Save
  saveContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray100,
    ...shadows.sm,
  },
  saveButton: {
    borderRadius: borderRadius.button,
    overflow: 'hidden',
  },
  saveButtonDisabled: {},
  saveGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.button,
  },
  saveGradientDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

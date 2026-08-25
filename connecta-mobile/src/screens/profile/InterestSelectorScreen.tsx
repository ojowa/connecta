import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface Interest {
  id: string;
  name: string;
  category?: string;
}

export const InterestSelectorScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { selectedIds = [] } = route?.params || {};
  const [allInterests, setAllInterests] = useState<Interest[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(ENDPOINTS.USERS.AVAILABLE_PROMPTS)
      .then((res: any) => {
        const data = res?.data || res;
        setAllInterests(Array.isArray(data) ? data : data?.interests || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleInterest = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 10) next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    navigation.navigate({ name: 'EditProfile', params: { selectedInterests: Array.from(selected) } });
  };

  const categories = [...new Set(allInterests.map(i => i.category || 'Other'))];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interests</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Save ({selected.size})</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Select up to 10 interests that describe you</Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        renderItem={({ item: category }) => (
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.interestsGrid}>
              {allInterests.filter(i => (i.category || 'Other') === category).map(interest => (
                <TouchableOpacity
                  key={interest.id}
                  style={[styles.interestChip, selected.has(interest.id) && styles.interestChipSelected]}
                  onPress={() => toggleInterest(interest.id)}
                >
                  <Text style={[styles.interestText, selected.has(interest.id) && styles.interestTextSelected]}>
                    {interest.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  headerTitle: { ...typography.h3 },
  saveText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  hint: { ...typography.caption, color: colors.textSecondary, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  list: { padding: spacing.md },
  categorySection: { marginBottom: spacing.xl },
  categoryTitle: { ...typography.h4, marginBottom: spacing.sm },
  interestsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  interestChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.gray100, borderWidth: 1, borderColor: colors.gray200 },
  interestChipSelected: { backgroundColor: colors.primary + '15', borderColor: colors.primary },
  interestText: { ...typography.caption, color: colors.textPrimary },
  interestTextSelected: { color: colors.primary, fontWeight: '600' },
});

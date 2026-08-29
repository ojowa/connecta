import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { apiClient } from '../../services/api/apiClient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { usePlanInfo } from '../../hooks/useMatch';

const GENDER_OPTIONS = ['everyone', 'men', 'women'];
const RELATIONSHIP_GOALS = ['any', 'long_term', 'casual', 'friendship', 'new_friends'];
const GOAL_LABELS: Record<string, string> = { any: 'Any', long_term: 'Long Term', casual: 'Casual', friendship: 'Friendship', new_friends: 'New Friends' };

export default function PreferencesScreen({ navigation }: any) {
  const [showMe, setShowMe] = useState('everyone');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(50);
  const [maxDistance, setMaxDistance] = useState(50);
  const [relationshipGoal, setRelationshipGoal] = useState('any');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showPhotosOnly, setShowPhotosOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const appState = useRef(AppState.currentState);
  const { data: planInfo, refetch: refetchPlan } = usePlanInfo();
  const isPremium = planInfo?.isPremium;

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        refetchPlan();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [refetchPlan]);

  useEffect(() => {
    const unsub = navigation?.addListener?.('focus', () => {
      refetchPlan();
    });
    return unsub;
  }, [navigation, refetchPlan]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const prefs: any = { showMe, ageMin, ageMax, maxDistanceKm: maxDistance };
      if (isPremium) {
        prefs.relationshipGoal = relationshipGoal;
        prefs.showVerifiedOnly = showVerifiedOnly;
        prefs.showProfilesWithPhotosOnly = showPhotosOnly;
      }
      await apiClient.put('/users/me/preferences', prefs);
      Alert.alert('Success', 'Preferences saved');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Show Me</Text>
        <View style={styles.row}>
          {GENDER_OPTIONS.map((opt) => (
            <Button
              key={opt}
              title={opt.charAt(0).toUpperCase() + opt.slice(1)}
              variant={showMe === opt ? 'primary' : 'outline'}
              onPress={() => setShowMe(opt)}
              style={styles.optionBtn}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Age Range: {ageMin} - {ageMax}</Text>
        <View style={styles.row}>
          <Button title="-" variant="outline" onPress={() => setAgeMin(Math.max(18, ageMin - 1))} style={styles.smallBtn} />
          <Text style={styles.value}>{ageMin}</Text>
          <Button title="+" variant="outline" onPress={() => setAgeMin(Math.min(ageMax - 1, ageMin + 1))} style={styles.smallBtn} />
          <View style={{ width: 20 }} />
          <Button title="-" variant="outline" onPress={() => setAgeMax(Math.max(ageMin + 1, ageMax - 1))} style={styles.smallBtn} />
          <Text style={styles.value}>{ageMax}</Text>
          <Button title="+" variant="outline" onPress={() => setAgeMax(Math.min(80, ageMax + 1))} style={styles.smallBtn} />
        </View>

        <Text style={styles.sectionTitle}>Max Distance: {maxDistance} km</Text>
        <View style={styles.row}>
          <Button title="-" variant="outline" onPress={() => setMaxDistance(Math.max(1, maxDistance - 5))} style={styles.smallBtn} />
          <Text style={styles.value}>{maxDistance}</Text>
          <Button title="+" variant="outline" onPress={() => setMaxDistance(Math.min(200, maxDistance + 5))} style={styles.smallBtn} />
        </View>

        <View style={styles.divider} />

        <View style={styles.premiumHeader}>
          <Text style={styles.sectionTitle}>Advanced Filters</Text>
          {!isPremium && (
            <View style={styles.proBadge}>
              <Ionicons name="diamond" size={10} color={colors.white} />
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
        </View>

        <Text style={styles.filterLabel}>Relationship Goal</Text>
        <View style={styles.row}>
          {RELATIONSHIP_GOALS.map((goal) => (
            <Button
              key={goal}
              title={GOAL_LABELS[goal]}
              variant={relationshipGoal === goal ? 'primary' : 'outline'}
              onPress={() => isPremium && setRelationshipGoal(goal)}
              style={[styles.optionBtn, ...(isPremium ? [] : [styles.disabledFilter])]}
              disabled={!isPremium}
            />
          ))}
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Verified Only</Text>
          <Button
            title={showVerifiedOnly ? 'On' : 'Off'}
            variant={showVerifiedOnly ? 'primary' : 'outline'}
            onPress={() => isPremium && setShowVerifiedOnly(!showVerifiedOnly)}
            style={[styles.toggleBtn, ...(isPremium ? [] : [styles.disabledFilter])]}
            disabled={!isPremium}
          />
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Profiles with Photos Only</Text>
          <Button
            title={showPhotosOnly ? 'On' : 'Off'}
            variant={showPhotosOnly ? 'primary' : 'outline'}
            onPress={() => isPremium && setShowPhotosOnly(!showPhotosOnly)}
            style={[styles.toggleBtn, ...(isPremium ? [] : [styles.disabledFilter])]}
            disabled={!isPremium}
          />
        </View>

        {!isPremium && (
          <Text style={styles.premiumHint}>
            Upgrade to Premium to unlock advanced filters and find your perfect match faster.
          </Text>
        )}

        <Button title="Save" onPress={handleSave} loading={loading} style={styles.saveBtn} />
      </View>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, backgroundColor: colors.white },
  content: { padding: spacing.xl },
  sectionTitle: { ...typography.h3, marginTop: spacing.xl, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  optionBtn: { flex: 1, minWidth: 80 },
  smallBtn: { paddingHorizontal: spacing.md, minWidth: 44 },
  value: { ...typography.body, minWidth: 40, textAlign: 'center' },
  saveBtn: { marginTop: spacing.xxl },
  divider: { height: 1, backgroundColor: colors.gray100, marginVertical: spacing.lg },
  premiumHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 3,
  },
  proBadgeText: { color: colors.white, fontSize: 9, fontWeight: '800' },
  filterLabel: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  toggleBtn: { minWidth: 60 },
  disabledFilter: { opacity: 0.5 },
  premiumHint: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md, fontStyle: 'italic' },
});

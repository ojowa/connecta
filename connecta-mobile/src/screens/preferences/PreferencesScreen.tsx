import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { apiClient } from '../../services/api/apiClient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const GENDER_OPTIONS = ['everyone', 'men', 'women'];

export default function PreferencesScreen({ navigation }: any) {
  const [showMe, setShowMe] = useState('everyone');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(50);
  const [maxDistance, setMaxDistance] = useState(50);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiClient.put('/users/me/preferences', { showMe, ageMin, ageMax, maxDistanceKm: maxDistance });
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
              variant={showMe === opt ? 'default' : 'outline'}
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
});

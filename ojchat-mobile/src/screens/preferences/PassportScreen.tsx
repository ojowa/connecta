import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { usePlanInfo } from '../../hooks/useMatch';
import { useAppStore } from '../../store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

export default function PassportScreen({ navigation }: any) {
  const user = useAppStore((s) => s.user);
  const appState = useRef(AppState.currentState);
  const { data: planInfo, refetch: refetchPlan } = usePlanInfo();
  const isPremium = planInfo?.isPremium;
  const [city, setCity] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentCity, setCurrentCity] = useState('');

  useEffect(() => {
    fetchPassportStatus();
  }, []);

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

  const fetchPassportStatus = async () => {
    try {
      const res = await apiClient.get(ENDPOINTS.MATCHING.PASSPORT);
      const data = res.data as any;
      if (data) {
        setEnabled(data.enabled ?? false);
        setLatitude(data.latitude ?? 0);
        setLongitude(data.longitude ?? 0);
        setCity(data.city ?? '');
        setCurrentCity(data.city ?? 'Unknown');
      }
    } catch {
      // Passport not set yet, use defaults from profile
    }
  };

  const handleSave = async () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Required',
        'Your subscription may have expired. Please renew to use Passport.',
        [{ text: 'OK' }],
      );
      refetchPlan();
      return;
    }
    if (!city.trim()) {
      Alert.alert('Error', 'Please enter a city name');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post(ENDPOINTS.MATCHING.PASSPORT, {
        latitude,
        longitude,
        enabled,
        city: city.trim(),
      });
      Alert.alert('Success', 'Passport updated');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update passport');
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Passport</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Text style={{ fontSize: 56, marginBottom: spacing.md }}>🌍</Text>
          <Text style={typography.h2}>Premium Feature</Text>
          <Text
            style={[
              typography.body,
              {
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: spacing.sm,
                marginBottom: spacing.xl,
              },
            ]}
          >
            Upgrade to Premium to use Passport and swipe in cities around the world.
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => navigation.navigate('Subscription')}
            activeOpacity={0.7}
          >
            <Ionicons name="diamond" size={20} color={colors.white} />
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>

          <Text style={styles.title}>Passport</Text>
          <Text style={styles.subtitle}>
            Change your location to swipe in other cities around the world.
          </Text>

          <View style={styles.currentLocationCard}>
            <Text style={styles.label}>Current Location</Text>
            <Text style={styles.currentCity}>{currentCity || user?.fullName || 'Unknown'}</Text>
          </View>

          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapIcon}>🌍</Text>
            <Text style={styles.mapText}>{city || 'No destination set'}</Text>
          </View>

          <Text style={styles.label}>Search a City</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter city name..."
            placeholderTextColor={colors.gray400}
            value={city}
            onChangeText={setCity}
          />

          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setEnabled(!enabled)}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleLabel}>Enable Passport</Text>
            <View style={[styles.toggle, enabled && styles.toggleActive]}>
              <View style={[styles.toggleKnob, enabled && styles.toggleKnobActive]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Passport'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, backgroundColor: colors.white },
  content: { padding: spacing.xl },
  premiumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  premiumText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '700',
  },
  title: { ...typography.h1, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  currentLocationCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.card,
    marginBottom: spacing.xl,
  },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  currentCity: { ...typography.h3 },
  mapPlaceholder: {
    height: 160,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  mapIcon: { fontSize: 40, marginBottom: spacing.sm },
  mapText: { ...typography.body, color: colors.textSecondary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.input,
    padding: spacing.md,
    ...typography.body,
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  toggleLabel: { ...typography.body },
  toggle: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.gray300,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleActive: { backgroundColor: colors.primary },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  toggleKnobActive: { alignSelf: 'flex-end' },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { ...typography.button, color: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
  },
  upgradeButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { usePlanInfo } from '../../hooks/useMatch';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface ProfileViewer {
  id: string;
  userId: string;
  fullName: string;
  avatar?: string;
  viewedAt: string;
}

export const WhoViewedScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [viewers, setViewers] = useState<ProfileViewer[]>([]);
  const [loading, setLoading] = useState(true);
  const appState = useRef(AppState.currentState);
  const { data: planInfo, refetch: refetchPlan } = usePlanInfo();
  const isPremium = planInfo?.isPremium;

  const fetchViewers = () => {
    setLoading(true);
    apiClient.get(ENDPOINTS.MATCHING.PROFILE_VIEWERS, { params: { filter: 'discovery' } })
      .then((res: any) => {
        const data = res?.data || res;
        const list = data?.viewers || [];
        setViewers(list.map((v: any) => ({
          id: v.id,
          userId: v.userId,
          fullName: v.user?.fullName || 'Anonymous',
          avatar: v.user?.photos?.[0]?.url,
          viewedAt: v.viewedAt,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchViewers();
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

  if (loading) return <LoadingSpinner />;

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Who Viewed You</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.premiumContainer}>
          <View style={styles.lockedOverlay}>
            {viewers.slice(0, 3).map((v, i) => (
              <View key={v.id} style={[styles.blurredCard, { marginTop: i * 12 }]}>
                {v.avatar ? (
                  <Image source={{ uri: v.avatar }} style={styles.blurredAvatar} blurRadius={15} />
                ) : (
                  <View style={[styles.blurredAvatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarText}>?</Text>
                  </View>
                )}
                <View style={styles.viewerInfo}>
                  <View style={styles.blurredLine} />
                  <View style={[styles.blurredLine, { width: '60%' }]} />
                </View>
              </View>
            ))}
            <View style={styles.lockIconContainer}>
              <Ionicons name="lock-closed" size={40} color={colors.primary} />
            </View>
          </View>

          <Text style={styles.premiumTitle}>See Who Viewed You</Text>
          <Text style={styles.premiumSubtitle}>
            {viewers.length > 0
              ? `${viewers.length} ${viewers.length === 1 ? 'person' : 'people'} viewed your profile`
              : 'When someone views your profile, they\'ll appear here'}
          </Text>
          <Text style={styles.premiumHint}>
            Upgrade to premium to see who viewed your profile and view their full profiles.
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Who Viewed You</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={viewers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="eye-off-outline" size={64} color={colors.gray300} />
            <Text style={styles.emptyText}>No profile views yet</Text>
            <Text style={styles.emptySubtext}>When someone views your profile, they'll appear here</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.viewerCard} onPress={() => navigation.navigate('UserProfile', { userId: item.userId })}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.viewerInfo}>
              <Text style={styles.viewerName}>{item.fullName}</Text>
              <Text style={styles.viewerTime}>Viewed your profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  headerTitle: { ...typography.h3 },
  list: { padding: spacing.md },
  empty: { alignItems: 'center', paddingTop: 100 },
  emptyText: { ...typography.h3, marginTop: spacing.md },
  emptySubtext: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
  viewerCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.white, borderRadius: borderRadius.md, marginBottom: spacing.sm },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { backgroundColor: colors.gray200, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.h3, color: colors.gray500 },
  viewerInfo: { flex: 1, marginLeft: spacing.md },
  viewerName: { ...typography.body, fontWeight: '600' },
  viewerTime: { ...typography.caption, color: colors.textSecondary },
  premiumContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  lockedOverlay: { width: '100%', marginBottom: spacing.xl },
  blurredCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.white, borderRadius: borderRadius.md, opacity: 0.5 },
  blurredAvatar: { width: 50, height: 50, borderRadius: 25 },
  blurredLine: { height: 14, width: '80%', backgroundColor: colors.gray200, borderRadius: 4, marginBottom: spacing.xs },
  lockIconContainer: { position: 'absolute', alignSelf: 'center', top: '50%', transform: [{ translateY: -20 }], backgroundColor: colors.white, borderRadius: 30, padding: spacing.sm, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 },
  premiumTitle: { ...typography.h2, marginBottom: spacing.sm },
  premiumSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xs },
  premiumHint: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl, paddingHorizontal: spacing.lg },
  upgradeButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.button },
  upgradeButtonText: { ...typography.button, color: colors.white },
});

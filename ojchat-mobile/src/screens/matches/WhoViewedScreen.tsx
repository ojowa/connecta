import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
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

type TabType = 'discovery' | 'matched';

export const WhoViewedScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [viewers, setViewers] = useState<ProfileViewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('discovery');

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.get('/users/me').then((r) => r.data),
  });

  const isPremium = me?.plan && me.plan !== 'free';

  const fetchViewers = (filter: TabType) => {
    setLoading(true);
    apiClient.get(ENDPOINTS.MATCHING.PROFILE_VIEWERS, { params: { filter } })
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
    fetchViewers(activeTab);
  }, [activeTab]);

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

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discovery' && styles.tabActive]}
          onPress={() => setActiveTab('discovery')}
        >
          <Text style={[styles.tabText, activeTab === 'discovery' && styles.tabTextActive]}>Discovery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'matched' && styles.tabActive]}
          onPress={() => setActiveTab('matched')}
        >
          <Text style={[styles.tabText, activeTab === 'matched' && styles.tabTextActive]}>Matched</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : (
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
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  headerTitle: { ...typography.h3 },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: borderRadius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: colors.white },
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

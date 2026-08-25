import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../services/api/apiClient';
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

  useEffect(() => {
    apiClient.get('/matching/liked-you?limit=50')
      .then((res: any) => {
        const data = res?.data || res;
        const likes = data?.likes || [];
        setViewers(likes.map((l: any) => ({
          id: l.id,
          userId: l.userId,
          fullName: l.user?.fullName || 'Anonymous',
          avatar: l.user?.photos?.[0]?.url,
          viewedAt: l.createdAt,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

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
});

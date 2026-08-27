import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMyLikes } from '../../hooks/useMatch';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface LikedUser {
  user: {
    id: string;
    fullName: string;
    photos: { id: string; url: string; isPrimary: boolean }[];
  };
  likedAt: string;
}

export const MyLikesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { data, isLoading } = useMyLikes();

  if (isLoading) return <LoadingSpinner />;

  const likes = data?.likes || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Likes</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subtitle}>People you liked who haven't liked you back</Text>

      <FlatList
        data={likes}
        keyExtractor={(item: LikedUser, index: number) => item.user?.id || item.likedUserId || `like-${index}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={64} color={colors.gray300} />
            <Text style={styles.emptyText}>No pending likes</Text>
            <Text style={styles.emptySubtext}>People you like will appear here until they like you back</Text>
          </View>
        }
        renderItem={({ item }: { item: LikedUser }) => {
          const primaryPhoto = item.user?.photos?.find((p) => p.isPrimary) || item.user?.photos?.[0];
          const timeAgo = item.likedAt ? getTimeAgo(item.likedAt) : '';

          return (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => navigation.navigate('UserProfile', { userId: item.user?.id })}
            >
              {primaryPhoto ? (
                <Image source={{ uri: primaryPhoto.url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>{item.user?.fullName?.charAt(0) || '?'}</Text>
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.user?.fullName}</Text>
                <Text style={styles.likedTime}>Liked {timeAgo}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

function getTimeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  headerTitle: { ...typography.h3 },
  subtitle: { ...typography.caption, color: colors.textSecondary, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  list: { padding: spacing.md },
  empty: { alignItems: 'center', paddingTop: 100 },
  emptyText: { ...typography.h3, marginTop: spacing.md },
  emptySubtext: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { backgroundColor: colors.gray200, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.h3, color: colors.gray500 },
  userInfo: { flex: 1, marginLeft: spacing.md },
  userName: { ...typography.body, fontWeight: '600' },
  likedTime: { ...typography.caption, color: colors.textSecondary },
});

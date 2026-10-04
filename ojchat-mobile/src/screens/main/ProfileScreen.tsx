import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { Avatar } from '../../components/common/Avatar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { shadows } from '../../theme/shadows';
import type { MainTabScreenProps } from '../../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  color?: string;
}

const PROFILE_MENU: MenuItem[] = [
  { icon: 'create-outline', label: 'Edit Profile', route: 'EditProfile' },
  { icon: 'pricetag-outline', label: 'Interests', route: 'InterestSelector' },
  { icon: 'camera-outline', label: 'Manage Photos', route: 'PhotoManager' },
  { icon: 'chatbubble-ellipses-outline', label: 'Profile Prompts', route: 'ProfilePrompts' },
  { icon: 'shield-checkmark-outline', label: 'Verify Profile', route: 'Verification' },
];

const DISCOVER_MENU: MenuItem[] = [
  { icon: 'options-outline', label: 'Discovery Preferences', route: 'Preferences' },
  { icon: 'film-outline', label: 'Moments', route: 'Moments' },
  { icon: 'flame-outline', label: 'Daily Streak', route: 'DailyStreak' },
];

const SOCIAL_MENU: MenuItem[] = [
  { icon: 'heart-outline', label: 'Likes You', route: 'LikesYou' },
  { icon: 'eye-outline', label: 'Who Viewed You', route: 'WhoViewed' },
  { icon: 'flash-outline', label: 'Boost Profile', route: 'Boost' },
  { icon: 'settings-outline', label: 'Settings', route: 'Settings' },
];

export const ProfileScreen: React.FC<MainTabScreenProps<'Profile'>> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get(ENDPOINTS.USERS.ME + '/profile').then((r) => r.data),
  });

  const profile = profileData?.profile;
  const photos = profileData?.photos || [];
  const primaryPhoto = photos.find((p: any) => p.isPrimary) || photos[0];

  const calculateCompletion = () => {
    let score = 0;
    if (user?.fullName) score += 15;
    if (profile?.bio) score += 15;
    if (profile?.jobTitle) score += 10;
    if (profile?.city) score += 10;
    if (profile?.photos?.length > 0) score += 20;
    if (profile?.photos?.length >= 3) score += 10;
    if (profile?.relationshipGoal) score += 10;
    if (profile?.interests?.length > 0) score += 10;
    return Math.min(score, 100);
  };

  const completion = calculateCompletion();

  const renderMenuSection = (title: string, items: MenuItem[]) => (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.menuCard}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.route}
            style={[styles.menuItem, index < items.length - 1 && styles.menuItemBorder]}
            onPress={() => navigation.navigate(item.route as never)}
            activeOpacity={0.6}
          >
            <View
              style={[
                styles.menuIconContainer,
                item.color && { backgroundColor: item.color + '15' },
              ]}
            >
              <Ionicons name={item.icon} size={20} color={item.color || colors.primary} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.gray300} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Photo Hero Header */}
        <View style={styles.heroContainer}>
          {primaryPhoto?.url || user?.avatarUrl ? (
            <>
              <Avatar
                uri={primaryPhoto?.url || user?.avatarUrl}
                size={120}
                style={styles.heroAvatar}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.heroGradient}
              />
            </>
          ) : (
            <View style={styles.heroPlaceholder}>
              <Avatar uri={null} size={120} name={user?.fullName} />
            </View>
          )}

          {/* Completion Ring */}
          {completion < 100 && (
            <View style={styles.completionBadge}>
              <Text style={styles.completionPercent}>{completion}%</Text>
            </View>
          )}

          {/* Name Overlay */}
          <View style={styles.heroInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.heroName}>{user?.fullName}</Text>
              {profile?.verified && (
                <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              )}
            </View>
            {profile?.bio && (
              <Text style={styles.heroBio} numberOfLines={2}>
                {profile.bio}
              </Text>
            )}
          </View>
        </View>

        {/* Completion Banner */}
        {completion < 100 && (
          <View style={styles.completionBanner}>
            <View style={styles.completionBannerContent}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.completionBannerText}>
                Complete your profile to get more matches
              </Text>
            </View>
            <View style={styles.completionBar}>
              <View style={[styles.completionFill, { width: `${completion}%` }]} />
            </View>
          </View>
        )}

        {/* Menu Sections */}
        {renderMenuSection('Profile', PROFILE_MENU)}
        {renderMenuSection('Discover', DISCOVER_MENU)}
        {renderMenuSection('Social', SOCIAL_MENU)}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.6}>
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Edit Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('EditProfile')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="create-outline" size={24} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.gray50 },

  // Hero
  heroContainer: {
    height: 280,
    backgroundColor: colors.gray200,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  heroAvatar: {
    position: 'absolute',
    top: spacing.xl,
    alignSelf: 'center',
    borderWidth: 4,
    borderColor: colors.white,
    ...shadows.lg,
  },
  heroPlaceholder: {
    position: 'absolute',
    top: spacing.xl,
    alignSelf: 'center',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  completionBadge: {
    position: 'absolute',
    top: spacing.xl + 100,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  completionPercent: {
    ...typography.small,
    color: colors.white,
    fontWeight: '700',
  },
  heroInfo: {
    zIndex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroName: {
    ...typography.h1,
    color: colors.white,
  },
  heroBio: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },

  // Completion Banner
  completionBanner: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.card,
    ...shadows.card,
  },
  completionBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  completionBannerText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  completionBar: {
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: 3,
  },
  completionFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },

  // Menu
  menuSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    ...shadows.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray100,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryOverlay,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuLabel: {
    ...typography.body,
    flex: 1,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
    marginHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    ...shadows.card,
  },
  logoutText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '500',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },

  bottomSpacer: { height: spacing.xxl + 20 },
});

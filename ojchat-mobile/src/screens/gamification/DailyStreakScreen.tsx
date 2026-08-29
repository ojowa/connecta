import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { shadows } from '../../theme/shadows';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STREAK_REWARDS = [
  { day: 3, reward: '1 Super Like', icon: 'star' as const, color: '#F59E0B' },
  { day: 5, reward: '10 Credits', icon: 'wallet' as const, color: '#8B5CF6' },
  { day: 7, reward: '1 Free Boost', icon: 'rocket' as const, color: '#EC4899' },
  { day: 14, reward: '3 Super Likes', icon: 'star' as const, color: '#F59E0B' },
  { day: 30, reward: '1 Day Premium', icon: 'diamond' as const, color: '#06B6D4' },
];

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  todayCheckedIn: boolean;
  weekCheckIns: boolean[];
  lastCheckInAt: string | null;
  claimedRewards: string[];
}

interface CheckInResult {
  message: string;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  todayCheckedIn: boolean;
  weekCheckIns: boolean[];
  lastCheckInAt: string;
  claimedRewards: string[];
  newReward: string | null;
}

export const DailyStreakScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const queryClient = useQueryClient();
  const flameScale = useRef(new Animated.Value(1)).current;
  const [showReward, setShowReward] = useState<string | null>(null);

  const { data: streakData, isLoading } = useQuery<StreakData>({
    queryKey: ['streak'],
    queryFn: () => apiClient.get(ENDPOINTS.USERS.STREAK).then((r) => r.data),
  });

  const weekCheckIns = streakData?.weekCheckIns || [false, false, false, false, false, false, false];
  const claimedRewards = streakData?.claimedRewards || [];
  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;
  const totalCheckIns = streakData?.totalCheckIns || 0;
  const todayCheckedIn = streakData?.todayCheckedIn || false;

  const checkInMutation = useMutation<CheckInResult>({
    mutationFn: () => apiClient.post(ENDPOINTS.USERS.STREAK_CHECK_IN).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      if (data.newReward) {
        const reward = STREAK_REWARDS.find(r => {
          const rewardMap: Record<string, number> = {
            super_like: 3, credits_10: 5, boost: 7, super_like_3: 14, premium_day: 30,
          };
          return rewardMap[data.newReward!] === (data.currentStreak || 0);
        });
        setShowReward(reward?.reward || 'a reward');
      }
      Animated.sequence([
        Animated.spring(flameScale, { toValue: 1.3, useNativeDriver: true }),
        Animated.spring(flameScale, { toValue: 1, useNativeDriver: true }),
      ]).start();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to check in. Please try again.');
    },
  });

  useEffect(() => {
    if (currentStreak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameScale, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
          Animated.timing(flameScale, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [streakData?.currentStreak]);

  if (isLoading) return <LoadingSpinner message="Loading streak..." />;
  if (!streakData) return null;

  const nextMilestone = STREAK_REWARDS.find(r => r.day > currentStreak);
  const progressToNext = nextMilestone
    ? (currentStreak / nextMilestone.day) * 100
    : 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Streak</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Streak Hero */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#FFF7ED', '#FEF3C7', '#FDE68A']}
            style={styles.heroGradient}
          >
            <Animated.View style={[styles.flameContainer, { transform: [{ scale: flameScale }] }]}>
              <LinearGradient
                colors={['#F97316', '#EF4444']}
                style={styles.flameGradient}
              >
                <Ionicons name="flame" size={48} color={colors.white} />
              </LinearGradient>
            </Animated.View>
            <Text style={styles.streakCount}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
            {longestStreak > 0 && (
              <Text style={styles.bestStreak}>Best: {longestStreak} days</Text>
            )}
          </LinearGradient>
        </View>

        {/* Week Calendar */}
        <View style={styles.weekCard}>
          <Text style={styles.weekTitle}>This Week</Text>
          <View style={styles.daysRow}>
            {DAYS.map((day, i) => {
              const isChecked = weekCheckIns[i];
              const isToday = new Date().getDay() === (i + 1) % 7;
              return (
                <View key={day} style={styles.dayColumn}>
                  <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{day}</Text>
                  <View style={[
                    styles.dayCircle,
                    isChecked && styles.dayCircleChecked,
                    isToday && !isChecked && styles.dayCircleToday,
                  ]}>
                    {isChecked ? (
                      <Ionicons name="checkmark" size={16} color={colors.white} />
                    ) : (
                      <Text style={[styles.dayLetter, isToday && styles.dayLetterToday]}>
                        {day.charAt(0)}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Check In Button */}
        {!todayCheckedIn && (
          <TouchableOpacity
            style={styles.checkInButton}
            onPress={() => checkInMutation.mutate()}
            disabled={checkInMutation.isPending}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.checkInGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {checkInMutation.isPending ? (
                <Text style={styles.checkInText}>Checking in...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
                  <Text style={styles.checkInText}>Check In Today</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

            {todayCheckedIn && (
              <View style={styles.checkedInBanner}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.checkedInText}>You've checked in today!</Text>
              </View>
            )}

            {/* Next Milestone Progress */}
            {nextMilestone && (
              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Ionicons name="flag-outline" size={18} color={colors.primary} />
                  <Text style={styles.progressTitle}>Next Reward</Text>
                </View>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressReward}>{nextMilestone.reward}</Text>
                  <Text style={styles.progressDays}>
                    {nextMilestone.day - currentStreak} day{nextMilestone.day - currentStreak !== 1 ? 's' : ''} to go
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={[colors.gradientStart, colors.gradientEnd]}
                    style={[styles.progressFill, { width: `${Math.max(progressToNext, 5)}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={styles.progressCount}>
                  Day {currentStreak} of {nextMilestone.day}
                </Text>
              </View>
            )}

            {/* Rewards Timeline */}
            <View style={styles.rewardsSection}>
              <Text style={styles.rewardsTitle}>Streak Rewards</Text>
              {STREAK_REWARDS.map((reward) => {
                const isClaimed = claimedRewards.some(r => {
              const map: Record<string, number> = { super_like: 3, credits_10: 5, boost: 7, super_like_3: 14, premium_day: 30 };
              return map[r] === reward.day;
            });
                const isAchieved = currentStreak >= reward.day;
            return (
              <View key={reward.day} style={[styles.rewardItem, isAchieved && styles.rewardItemAchieved]}>
                <View style={[styles.rewardIconContainer, { backgroundColor: reward.color + '15' }]}>
                  <Ionicons name={reward.icon} size={20} color={reward.color} />
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardDay}>Day {reward.day}</Text>
                  <Text style={styles.rewardText}>{reward.reward}</Text>
                </View>
                {isClaimed ? (
                  <View style={styles.claimedBadge}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    <Text style={styles.claimedText}>Claimed</Text>
                  </View>
                ) : isAchieved ? (
                  <View style={[styles.claimedBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="gift" size={18} color="#F59E0B" />
                  </View>
                ) : (
                  <View style={styles.lockedBadge}>
                    <Ionicons name="lock-closed" size={14} color={colors.gray400} />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalCheckIns}</Text>
            <Text style={styles.statLabel}>Total Check-ins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Reward Modal */}
      {showReward && (
        <View style={styles.rewardOverlay}>
          <View style={styles.rewardModal}>
            <Ionicons name="gift" size={64} color={colors.primary} />
            <Text style={styles.rewardModalTitle}>Reward Unlocked!</Text>
            <Text style={styles.rewardModalText}>{showReward}</Text>
            <TouchableOpacity
              style={styles.rewardModalButton}
              onPress={() => setShowReward(null)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.rewardModalGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.rewardModalButtonText}>Awesome!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.gray50 },
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray100,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...typography.h3, flex: 1, textAlign: 'center' },

  // Hero
  heroSection: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    ...shadows.lg,
  },
  heroGradient: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  flameContainer: {
    marginBottom: spacing.md,
  },
  flameGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  streakCount: {
    fontSize: 56,
    fontWeight: '800',
    color: '#F97316',
  },
  streakLabel: {
    ...typography.h3,
    color: '#92400E',
    marginTop: -spacing.xs,
  },
  bestStreak: {
    ...typography.caption,
    color: '#B45309',
    marginTop: spacing.xs,
  },

  // Week
  weekCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    ...shadows.card,
  },
  weekTitle: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayLabel: {
    ...typography.small,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  dayLabelToday: {
    color: colors.primary,
    fontWeight: '700',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleChecked: {
    backgroundColor: colors.primary,
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primaryOverlay,
  },
  dayLetter: {
    ...typography.caption,
    color: colors.gray500,
    fontWeight: '600',
  },
  dayLetterToday: {
    color: colors.primary,
  },

  // Check In
  checkInButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.button,
    overflow: 'hidden',
    ...shadows.card,
  },
  checkInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.button,
  },
  checkInText: {
    ...typography.button,
    color: colors.white,
  },
  checkedInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#ECFDF5',
    borderRadius: borderRadius.card,
  },
  checkedInText: {
    ...typography.body,
    color: colors.success,
    fontWeight: '600',
  },

  // Progress
  progressCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    ...shadows.card,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressReward: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressDays: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressCount: {
    ...typography.small,
    color: colors.textTertiary,
    textAlign: 'right',
  },

  // Rewards
  rewardsSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
  },
  rewardsTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  rewardItemAchieved: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  rewardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardDay: {
    ...typography.small,
    color: colors.textTertiary,
  },
  rewardText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  claimedText: {
    ...typography.small,
    color: colors.success,
    fontWeight: '600',
  },
  lockedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  bottomSpacer: { height: spacing.xxl },

  // Reward Modal
  rewardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  rewardModal: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    width: '80%',
    ...shadows.lg,
  },
  rewardModalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  rewardModalText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  rewardModalButton: {
    width: '100%',
    borderRadius: borderRadius.button,
    overflow: 'hidden',
  },
  rewardModalGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.button,
  },
  rewardModalButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

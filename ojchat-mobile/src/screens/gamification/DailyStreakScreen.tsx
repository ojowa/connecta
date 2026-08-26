import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const REWARDS = [
  { day: 1, reward: '5 Credits', icon: 'coin' },
  { day: 3, reward: '1 Super Like', icon: 'star' },
  { day: 5, reward: '10 Credits', icon: 'coin' },
  { day: 7, reward: '1 Free Boost', icon: 'rocket' },
];

export const DailyStreakScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentStreak] = useState(3);
  const [todayCheckedIn] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Streak</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.streakContainer}>
        <Ionicons name="flame" size={64} color="#f59e0b" />
        <Text style={styles.streakCount}>{currentStreak}</Text>
        <Text style={styles.streakLabel}>Day Streak</Text>
        <Text style={styles.streakHint}>Keep checking in daily to earn rewards!</Text>
      </View>

      <View style={styles.daysContainer}>
        {DAYS.map((day, i) => {
          const isChecked = i < currentStreak;
          const isToday = i === currentStreak;
          return (
            <View key={day} style={[styles.dayCircle, isChecked && styles.dayChecked, isToday && styles.dayToday]}>
              {isChecked ? (
                <Ionicons name="checkmark" size={20} color={colors.white} />
              ) : (
                <Text style={[styles.dayText, isToday && styles.dayTextToday]}>{day.charAt(0)}</Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.rewardsSection}>
        <Text style={styles.rewardsTitle}>Streak Rewards</Text>
        {REWARDS.map((r) => (
          <View key={r.day} style={[styles.rewardItem, currentStreak >= r.day && styles.rewardClaimed]}>
            <Ionicons name={r.icon as any} size={24} color={currentStreak >= r.day ? colors.primary : colors.gray400} />
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardDay}>Day {r.day}</Text>
              <Text style={styles.rewardText}>{r.reward}</Text>
            </View>
            {currentStreak >= r.day ? (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            ) : (
              <Text style={styles.rewardLocked}>Locked</Text>
            )}
          </View>
        ))}
      </View>

      {!todayCheckedIn && (
        <TouchableOpacity style={styles.checkInButton}>
          <Text style={styles.checkInText}>Check In Today</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  headerTitle: { ...typography.h3 },
  streakContainer: { alignItems: 'center', paddingVertical: spacing.xxl },
  streakCount: { ...typography.h1, fontSize: 64, color: '#f59e0b', fontWeight: '800' },
  streakLabel: { ...typography.h3, color: colors.textSecondary },
  streakHint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  daysContainer: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  dayCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  dayChecked: { backgroundColor: colors.primary },
  dayToday: { borderWidth: 2, borderColor: colors.primary },
  dayText: { ...typography.caption, color: colors.gray500, fontWeight: '600' },
  dayTextToday: { color: colors.primary },
  rewardsSection: { padding: spacing.xl },
  rewardsTitle: { ...typography.h4, marginBottom: spacing.md },
  rewardItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.white, borderRadius: borderRadius.md, marginBottom: spacing.sm },
  rewardClaimed: { opacity: 0.7 },
  rewardInfo: { flex: 1, marginLeft: spacing.md },
  rewardDay: { ...typography.caption, color: colors.textSecondary },
  rewardText: { ...typography.body, fontWeight: '600' },
  rewardLocked: { ...typography.caption, color: colors.gray400 },
  checkInButton: { backgroundColor: colors.primary, margin: spacing.xl, borderRadius: borderRadius.button, paddingVertical: spacing.md, alignItems: 'center' },
  checkInText: { ...typography.button, color: colors.white },
});

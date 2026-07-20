import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface RowProps {
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}

const SettingsRow: React.FC<RowProps> = ({ label, onPress, rightElement, destructive }) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.6 : 1}
  >
    <Text
      style={[styles.rowLabel, destructive && styles.destructiveText]}
      numberOfLines={1}
    >
      {label}
    </Text>
    {rightElement || <Text style={styles.chevron}>›</Text>}
  </TouchableOpacity>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
);

const SettingsScreen: React.FC = () => {
  const [matchNotifications, setMatchNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [callNotifications, setCallNotifications] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <SectionHeader title="Account" />
        <View style={styles.section}>
          <SettingsRow label="Edit Phone" onPress={() => {}} />
          <SettingsRow label="Edit Email" onPress={() => {}} />
          <SettingsRow label="Change Password" onPress={() => {}} />
          <SettingsRow label="Two-Factor Auth" onPress={() => {}} />
          <SettingsRow label="Devices" onPress={() => {}} />
        </View>

        <SectionHeader title="Discovery" />
        <View style={styles.section}>
          <SettingsRow label="Age Range" onPress={() => {}} />
          <SettingsRow label="Distance" onPress={() => {}} />
          <SettingsRow label="Show Me" onPress={() => {}} />
        </View>

        <SectionHeader title="Notifications" />
        <View style={styles.section}>
          <SettingsRow
            label="Match Notifications"
            rightElement={
              <Switch
                value={matchNotifications}
                onValueChange={setMatchNotifications}
                trackColor={{ false: colors.gray300, true: colors.primary }}
                thumbColor={colors.white}
              />
            }
          />
          <SettingsRow
            label="Message Notifications"
            rightElement={
              <Switch
                value={messageNotifications}
                onValueChange={setMessageNotifications}
                trackColor={{ false: colors.gray300, true: colors.primary }}
                thumbColor={colors.white}
              />
            }
          />
          <SettingsRow
            label="Call Notifications"
            rightElement={
              <Switch
                value={callNotifications}
                onValueChange={setCallNotifications}
                trackColor={{ false: colors.gray300, true: colors.primary }}
                thumbColor={colors.white}
              />
            }
          />
          <SettingsRow label="Quiet Hours" onPress={() => {}} />
        </View>

        <SectionHeader title="Privacy" />
        <View style={styles.section}>
          <SettingsRow label="Block List" onPress={() => {}} />
          <SettingsRow label="Download Data" onPress={() => {}} />
          <SettingsRow label="Delete Account" onPress={() => {}} destructive />
        </View>

        <SectionHeader title="Subscription" />
        <View style={styles.section}>
          <SettingsRow label="Current Plan" onPress={() => {}} />
          <SettingsRow label="Manage Subscription" onPress={() => {}} />
          <SettingsRow label="Payment History" onPress={() => {}} />
        </View>

        <SectionHeader title="Support" />
        <View style={styles.section}>
          <SettingsRow label="Help Center" onPress={() => {}} />
          <SettingsRow label="Report a Problem" onPress={() => {}} />
          <SettingsRow label="Community Guidelines" onPress={() => {}} />
        </View>

        <SectionHeader title="About" />
        <View style={styles.section}>
          <SettingsRow label="App Version" rightElement={<Text style={styles.versionText}>1.0.0</Text>} />
          <SettingsRow label="Terms of Service" onPress={() => {}} />
          <SettingsRow label="Privacy Policy" onPress={() => {}} />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
  chevron: {
    fontSize: 22,
    color: colors.gray400,
    marginLeft: spacing.sm,
  },
  versionText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});

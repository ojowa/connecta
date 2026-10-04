import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { useAppStore } from '../../store';
import { CONFIG_URLS } from '../../constants/config';
import { useAuth } from '../../hooks/useAuth';
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
    <Text style={[styles.rowLabel, destructive && styles.destructiveText]} numberOfLines={1}>
      {label}
    </Text>
    {rightElement || <Text style={styles.chevron}>›</Text>}
  </TouchableOpacity>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
);

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const queryClient = useQueryClient();
  const { logout: authLogout } = useAuth();
  const [exporting, setExporting] = useState(false);

  const { data: prefs } = useQuery({
    queryKey: ['notificationPrefs'],
    queryFn: () => apiClient.get(ENDPOINTS.NOTIFICATIONS.PREFERENCES).then((r) => r.data),
  });

  const [matchNotifications, setMatchNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [callNotifications, setCallNotifications] = useState(false);

  useEffect(() => {
    if (prefs) {
      setMatchNotifications(prefs.matchNotify ?? true);
      setMessageNotifications(prefs.messageNotify ?? true);
      setCallNotifications(prefs.callNotify ?? true);
    }
  }, [prefs]);

  const updatePrefsMutation = useMutation({
    mutationFn: (p: any) => apiClient.put(ENDPOINTS.NOTIFICATIONS.PREFERENCES, p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificationPrefs'] }),
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => authLogout() },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.prompt(
      'Delete Account',
      'Enter your password to confirm deletion. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async (password?: string) => {
            if (!password) return;
            try {
              await apiClient.delete(ENDPOINTS.USERS.DELETE, { data: { password } });
              authLogout();
            } catch {
              Alert.alert('Error', 'Failed to delete account. Check your password.');
            }
          },
        },
      ],
      'secure-text',
    );
  };

  const handleDownloadData = async () => {
    setExporting(true);
    try {
      await apiClient.post(ENDPOINTS.USERS.EXPORT_DATA);
      Alert.alert(
        'Request Submitted',
        'Your data export is being prepared. You will receive a download link via email within 24 hours.',
      );
    } catch {
      Alert.alert('Error', 'Failed to request data export. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleOpenUrl = (url: string, title: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', `Cannot open ${title}. Please try again later.`);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <SectionHeader title="Account" />
        <View style={styles.section}>
          <SettingsRow label="Edit Phone" onPress={() => navigation.navigate('EditPhone')} />
          <SettingsRow label="Edit Email" onPress={() => navigation.navigate('EditEmail')} />
          <SettingsRow
            label="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <SettingsRow
            label="Two-Factor Auth"
            onPress={() => navigation.navigate('TwoFactorAuth')}
          />
          <SettingsRow label="Devices" onPress={() => navigation.navigate('Devices')} />
        </View>

        <SectionHeader title="Discovery" />
        <View style={styles.section}>
          <SettingsRow label="Age Range" onPress={() => navigation.navigate('Preferences')} />
          <SettingsRow label="Distance" onPress={() => navigation.navigate('Preferences')} />
          <SettingsRow label="Show Me" onPress={() => navigation.navigate('Preferences')} />
        </View>

        <SectionHeader title="Notifications" />
        <View style={styles.section}>
          <SettingsRow
            label="Match Notifications"
            rightElement={
              <Switch
                value={matchNotifications}
                onValueChange={(v) => {
                  setMatchNotifications(v);
                  updatePrefsMutation.mutate({ matchNotify: v });
                }}
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
                onValueChange={(v) => {
                  setMessageNotifications(v);
                  updatePrefsMutation.mutate({ messageNotify: v });
                }}
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
                onValueChange={(v) => {
                  setCallNotifications(v);
                  updatePrefsMutation.mutate({ callNotify: v });
                }}
                trackColor={{ false: colors.gray300, true: colors.primary }}
                thumbColor={colors.white}
              />
            }
          />
          <SettingsRow label="Quiet Hours" onPress={() => navigation.navigate('QuietHours')} />
        </View>

        <SectionHeader title="Privacy" />
        <View style={styles.section}>
          <SettingsRow label="Incognito Mode" onPress={() => navigation.navigate('Incognito')} />
          <SettingsRow label="Passport" onPress={() => navigation.navigate('Passport')} />
          <SettingsRow label="Block List" onPress={() => navigation.navigate('BlockList')} />
          <SettingsRow
            label={exporting ? 'Requesting...' : 'Download Data'}
            onPress={handleDownloadData}
            rightElement={
              exporting ? <ActivityIndicator size="small" color={colors.primary} /> : undefined
            }
          />
          <SettingsRow label="Delete Account" onPress={handleDeleteAccount} destructive />
        </View>

        <SectionHeader title="Subscription" />
        <View style={styles.section}>
          <SettingsRow label="Current Plan" onPress={() => navigation.navigate('Subscription')} />
          <SettingsRow
            label="Manage Subscription"
            onPress={() => navigation.navigate('Subscription')}
          />
          <SettingsRow label="Payment History" onPress={() => navigation.navigate('Wallet')} />
        </View>

        <SectionHeader title="Support" />
        <View style={styles.section}>
          <SettingsRow
            label="Help Center"
            onPress={() => handleOpenUrl(CONFIG_URLS.HELP, 'Help Center')}
          />
          <SettingsRow
            label="Report a Problem"
            onPress={() => navigation.navigate('ReportProblem')}
          />
          <SettingsRow
            label="Community Guidelines"
            onPress={() => handleOpenUrl(CONFIG_URLS.GUIDELINES, 'Community Guidelines')}
          />
        </View>

        <SectionHeader title="About" />
        <View style={styles.section}>
          <SettingsRow
            label="App Version"
            rightElement={<Text style={styles.versionText}>1.0.0</Text>}
          />
          <SettingsRow
            label="Terms of Service"
            onPress={() => handleOpenUrl(CONFIG_URLS.TERMS, 'Terms of Service')}
          />
          <SettingsRow
            label="Privacy Policy"
            onPress={() => handleOpenUrl(CONFIG_URLS.PRIVACY, 'Privacy Policy')}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

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
  logoutButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
    backgroundColor: colors.error + '10',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutButtonText: {
    ...typography.button,
    color: colors.error,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});

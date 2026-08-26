import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert, ActivityIndicator, TextInput, Image, ScrollView, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { authApi } from '../../services/api/authApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

export default function TwoFactorAuthScreen() {
  const queryClient = useQueryClient();
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState(['', '', '', '', '', '']);
  const [disableCode, setDisableCode] = useState(['', '', '', '', '', '']);
  const [showDisable, setShowDisable] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['twoFactorSettings'],
    queryFn: () => authApi.get2FASettings().then((r: any) => r?.data || r),
  });

  const setupMutation = useMutation({
    mutationFn: () => authApi.setup2fa(),
    onSuccess: (res: any) => {
      const data = res?.data || res;
      setSetupData({ secret: data.secret, qrCodeUrl: data.qrCodeUrl });
    },
    onError: () => Alert.alert('Error', 'Failed to start authenticator setup.'),
  });

  const verifySetupMutation = useMutation({
    mutationFn: (code: string) => authApi.verify2faSetup(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twoFactorSettings'] });
      setSetupData(null);
      setVerifyCode(['', '', '', '', '', '']);
      Alert.alert('Success', 'Authenticator app enabled!');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Invalid code. Try again.');
    },
  });

  const disableMutation = useMutation({
    mutationFn: (code: string) => authApi.disable2fa(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twoFactorSettings'] });
      setShowDisable(false);
      setDisableCode(['', '', '', '', '', '']);
      Alert.alert('Success', 'Two-factor authentication disabled.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Invalid code. Try again.');
    },
  });

  const handleAuthenticatorToggle = (enabled: boolean) => {
    if (enabled) {
      setupMutation.mutate();
    } else {
      setShowDisable(true);
    }
  };

  const handleVerifySetup = () => {
    const code = verifyCode.join('');
    if (code.length !== 6) return;
    verifySetupMutation.mutate(code);
  };

  const handleDisable = () => {
    const code = disableCode.join('');
    if (code.length !== 6) return;
    disableMutation.mutate(code);
  };

  const copySecret = () => {
    if (setupData?.secret) {
      Clipboard.setString(setupData.secret);
      Alert.alert('Copied', 'Secret key copied to clipboard.');
    }
  };

  const renderCodeInput = (code: string[], setCode: (c: string[]) => void) => (
    <View style={styles.otpContainer}>
      {code.map((digit, index) => (
        <TextInput
          key={index}
          style={styles.otpInput}
          value={digit}
          onChangeText={(text) => {
            const newCode = [...code];
            newCode[index] = text.slice(-1);
            setCode(newCode);
          }}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
        />
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.content}>
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>SMS Authentication</Text>
            <Text style={styles.rowDescription}>Receive a code via text message when signing in</Text>
          </View>
          <Switch
            value={settings?.enabled && settings?.method === 'sms' ? true : false}
            onValueChange={(v) => {
              apiClient.post('/auth/2fa/toggle', { enabled: v, method: 'sms' }).then(() => {
                queryClient.invalidateQueries({ queryKey: ['twoFactorSettings'] });
                Alert.alert('Updated', 'SMS authentication settings saved.');
              }).catch(() => Alert.alert('Error', 'Failed to update settings.'));
            }}
            trackColor={{ false: colors.gray300, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>Authenticator App</Text>
            <Text style={styles.rowDescription}>Use Google Authenticator or similar app</Text>
          </View>
          <Switch
            value={settings?.enabled && settings?.method === 'authenticator' ? true : false}
            onValueChange={handleAuthenticatorToggle}
            trackColor={{ false: colors.gray300, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        {setupData && (
          <View style={styles.setupContainer}>
            <Text style={styles.setupTitle}>Setup Authenticator</Text>
            <Text style={styles.setupDescription}>
              Scan this QR code with your authenticator app, or manually enter the secret key.
            </Text>
            <Image source={{ uri: setupData.qrCodeUrl }} style={styles.qrCode} />
            <Text style={styles.secretLabel}>Secret Key (tap to copy):</Text>
            <Text style={styles.secretKey} onPress={copySecret}>{setupData.secret}</Text>
            <Text style={styles.verifyLabel}>Enter the 6-digit code from your app:</Text>
            {renderCodeInput(verifyCode, setVerifyCode)}
            <Button title="Verify & Enable" onPress={handleVerifySetup} loading={verifySetupMutation.isPending} />
            <Button title="Cancel" variant="ghost" onPress={() => setSetupData(null)} style={styles.cancelButton} />
          </View>
        )}

        {showDisable && settings?.enabled && (
          <View style={styles.setupContainer}>
            <Text style={styles.setupTitle}>Disable 2FA</Text>
            <Text style={styles.setupDescription}>
              Enter the 6-digit code from your authenticator app to confirm.
            </Text>
            {renderCodeInput(disableCode, setDisableCode)}
            <Button title="Disable" onPress={handleDisable} loading={disableMutation.isPending} />
            <Button title="Cancel" variant="ghost" onPress={() => { setShowDisable(false); setDisableCode(['', '', '', '', '', '']); }} style={styles.cancelButton} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  rowInfo: { flex: 1, marginRight: spacing.md },
  rowLabel: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  rowDescription: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  setupContainer: { marginTop: spacing.xl, padding: spacing.lg, backgroundColor: colors.gray50, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.gray200 },
  setupTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  setupDescription: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.lg },
  qrCode: { width: 200, height: 200, alignSelf: 'center', marginBottom: spacing.lg, borderRadius: borderRadius.md },
  secretLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  secretKey: { ...typography.body, fontFamily: 'monospace', color: colors.primary, textAlign: 'center', padding: spacing.md, backgroundColor: colors.white, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.gray200, marginBottom: spacing.lg },
  verifyLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  otpInput: { flex: 1, maxWidth: 56, height: 56, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, textAlign: 'center', ...typography.h2 },
  cancelButton: { marginTop: spacing.sm },
});

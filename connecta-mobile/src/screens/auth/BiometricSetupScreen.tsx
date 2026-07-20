import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../components/common/Button';
import { BiometricAuthService } from '../../services/storage/biometricAuth';
import { useAppStore } from '../../store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const BiometricSetupScreen: React.FC = ({ navigation }: any) => {
  const setBiometricEnabled = useAppStore((s) => s.setBiometricEnabled);

  const handleEnable = async () => {
    const result = await BiometricAuthService.authenticate('Enable biometric login');
    if (result.success) { setBiometricEnabled(true); navigation.goBack(); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enable Biometric Login</Text>
      <Text style={styles.subtitle}>Use fingerprint or face recognition for quick sign-in</Text>
      <Button title="Enable" onPress={handleEnable} />
      <Button title="Skip" variant="ghost" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: spacing.xl, justifyContent: 'center' },
  title: { ...typography.h1, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface TwoFactorVerifyProps {
  navigation: any;
}

export const TwoFactorVerifyScreen: React.FC<TwoFactorVerifyProps> = ({ navigation }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const { verify2faLogin, loading, error: authError } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleVerify = async () => {
    const codeStr = code.join('');
    if (codeStr.length !== 6) return;
    setServerError(null);
    try {
      await verify2faLogin(codeStr);
      navigation.replace('Main');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Verification failed';
      setServerError(msg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Two-Factor Authentication</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code from your authenticator app</Text>
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
                if (text && index < 5) {
                  // auto-advance handled by next input ref
                }
              }}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>
        {(authError || serverError) && <Text style={styles.error}>{authError || serverError}</Text>}
        <Button title="Verify" onPress={handleVerify} loading={loading} />
        <Button
          title="Back to Login"
          variant="ghost"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  title: { ...typography.h1, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  otpInput: {
    flex: 1,
    maxWidth: 56,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    textAlign: 'center',
    ...typography.h2,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  backButton: { marginTop: spacing.md },
});

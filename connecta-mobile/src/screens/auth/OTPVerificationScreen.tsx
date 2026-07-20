import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Button } from '../../components/common/Button';
import { authApi } from '../../services/api/authApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface OTPScreenProps { route: any; navigation: any; }

export const OTPVerificationScreen: React.FC<OTPScreenProps> = ({ route, navigation }) => {
  const { identifier, purpose } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const response = await authApi.verifyOtp(identifier, code, purpose);
      if (response.data.verified) navigation.replace('Main');
    } catch (err: any) { setError(err.response?.data?.message || 'Verification failed'); }
    finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Code</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {identifier}</Text>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput key={index} style={styles.otpInput} value={digit} onChangeText={(text) => {
            const newOtp = [...otp]; newOtp[index] = text.slice(-1); setOtp(newOtp);
          }} keyboardType="number-pad" maxLength={1} selectTextOnFocus />
        ))}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Verify" onPress={handleVerify} loading={loading} />
      <Button title="Resend Code" variant="ghost" onPress={() => authApi.sendOtp('email', purpose, identifier)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: spacing.xl, justifyContent: 'center' },
  title: { ...typography.h1, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  otpInput: { width: 48, height: 56, borderWidth: 1, borderColor: colors.border, borderRadius: 8, textAlign: 'center', ...typography.h2 },
  error: { ...typography.caption, color: colors.error, textAlign: 'center', marginBottom: spacing.md },
});

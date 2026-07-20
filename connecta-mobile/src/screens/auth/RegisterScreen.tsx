import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface RegisterScreenProps { navigation: any; }

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const { register, loading, error } = useAuth();

  const handleRegister = async () => {
    if (!fullName || !email || !password || !dateOfBirth || !gender) return;
    if (password !== confirmPassword) return;
    try { await register({ email, password, fullName, dateOfBirth, gender }); } catch {}
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Find your perfect match</Text>
        <Input label="Full Name" placeholder="Enter your full name" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
        <Input label="Email" placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Date of Birth" placeholder="YYYY-MM-DD" value={dateOfBirth} onChangeText={setDateOfBirth} keyboardType="numeric" />
        <Input label="Gender" placeholder="male, female, non_binary" value={gender} onChangeText={setGender} autoCapitalize="none" />
        <Input label="Password" placeholder="Create a password" value={password} onChangeText={setPassword} secureTextEntry />
        <Input label="Confirm Password" placeholder="Confirm your password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        {error && <Text style={styles.error}>{error}</Text>}
        <Button title="Create Account" onPress={handleRegister} loading={loading} style={styles.button} />
        <Button title="Already have an account? Sign In" variant="ghost" onPress={() => navigation.goBack()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { padding: spacing.xl, paddingTop: spacing.xxl },
  title: { ...typography.h1, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  error: { ...typography.caption, color: colors.error, marginBottom: spacing.md },
  button: { marginTop: spacing.md },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface LoginScreenProps { navigation: any; }

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    if (!identifier || !password) return;
    try { await login(identifier, password); } catch (error) { console.warn('Login failed:', error); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
        <Input label="Email or Phone" placeholder="Enter your email or phone" value={identifier} onChangeText={setIdentifier} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Password" placeholder="Enter your password" value={password} onChangeText={setPassword} secureTextEntry />
        {error && <Text style={styles.error}>{error}</Text>}
        <Button title="Sign In" onPress={handleLogin} loading={loading} style={styles.button} />
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Don't have an account? <Text style={styles.linkBold}>Sign Up</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  title: { ...typography.h1, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  error: { ...typography.caption, color: colors.error, marginBottom: spacing.md },
  button: { marginTop: spacing.md },
  forgot: { ...typography.caption, color: colors.primary, textAlign: 'center', marginTop: spacing.md },
  link: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg },
  linkBold: { color: colors.primary, fontWeight: '600' },
});

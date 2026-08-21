import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface RegisterScreenProps { navigation: any; }

interface FormErrors {
  fullName?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENDER_VALUES = ['male', 'female', 'non_binary', 'other'];
const DOB_RE = /^(\d{2})-(\d{2})-(\d{4})$/;

function parseDob(ddmmyyyy: string): Date | null {
  const match = ddmmyyyy.match(DOB_RE);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const d = parseInt(dd, 10), m = parseInt(mm, 10), y = parseInt(yyyy, 10);
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900) return null;
  const date = new Date(y, m - 1, d);
  if (date.getDate() !== d || date.getMonth() !== m - 1 || date.getFullYear() !== y) return null;
  return date;
}

function toIsoDob(ddmmyyyy: string): string {
  const match = ddmmyyyy.match(DOB_RE);
  if (!match) return ddmmyyyy;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function validate(values: {
  fullName: string; email: string; dateOfBirth: string; gender: string; password: string; confirmPassword: string;
}): FormErrors {
  const errors: FormErrors = {};

  if (!values.fullName.trim()) errors.fullName = 'Full name is required';
  else if (values.fullName.trim().length < 2) errors.fullName = 'Name must be at least 2 characters';

  if (!values.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid email address';

  if (!values.dateOfBirth.trim()) errors.dateOfBirth = 'Date of birth is required';
  else if (!DOB_RE.test(values.dateOfBirth.trim())) errors.dateOfBirth = 'Use format DD-MM-YYYY';
  else {
    const dob = parseDob(values.dateOfBirth.trim());
    if (!dob) errors.dateOfBirth = 'Enter a valid date';
    else {
      const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) errors.dateOfBirth = 'You must be at least 18';
      else if (age > 120) errors.dateOfBirth = 'Enter a valid date';
    }
  }

  if (!values.gender.trim()) errors.gender = 'Gender is required';
  else if (!GENDER_VALUES.includes(values.gender.trim().toLowerCase())) errors.gender = `Must be: ${GENDER_VALUES.join(', ')}`;

  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 8) errors.password = 'At least 8 characters';
  else if (!/[A-Z]/.test(values.password) || !/[0-9]/.test(values.password)) errors.password = 'Include 1 uppercase and 1 number';

  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password';
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match';

  return errors;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const { register, loading, error } = useAuth();

  const handleRegister = async () => {
    const fieldErrors = validate({ fullName, email, dateOfBirth, gender, password, confirmPassword });
    setErrors(fieldErrors);
    setSubmitted(true);
    if (Object.keys(fieldErrors).length > 0) return;

    try {
      await register({ email: email.trim(), password, fullName: fullName.trim(), dateOfBirth: toIsoDob(dateOfBirth.trim()), gender: gender.trim().toLowerCase() });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed';
      console.warn('Registration failed:', msg);
    }
  };

  const setField = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    if (submitted) {
      const updated = { fullName, email, dateOfBirth, gender, password, confirmPassword };
      const key = setter === setFullName ? 'fullName' : setter === setEmail ? 'email' : setter === setDateOfBirth ? 'dateOfBirth' : setter === setGender ? 'gender' : setter === setPassword ? 'password' : 'confirmPassword';
      updated[key] = v;
      setErrors(validate(updated));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Find your perfect match</Text>
        <Input label="Full Name" placeholder="Enter your full name" value={fullName} onChangeText={setField(setFullName)} autoCapitalize="words" error={errors.fullName} />
        <Input label="Email" placeholder="Enter your email" value={email} onChangeText={setField(setEmail)} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
        <Input label="Date of Birth" placeholder="DD-MM-YYYY" value={dateOfBirth} onChangeText={setField(setDateOfBirth)} keyboardType="numeric" error={errors.dateOfBirth} />
        <Input label="Gender" placeholder="male, female, non_binary, other" value={gender} onChangeText={setField(setGender)} autoCapitalize="none" error={errors.gender} />
        <Input label="Password" placeholder="Min 8 chars, 1 uppercase, 1 number" value={password} onChangeText={setField(setPassword)} secureTextEntry error={errors.password} />
        <Input label="Confirm Password" placeholder="Confirm your password" value={confirmPassword} onChangeText={setField(setConfirmPassword)} secureTextEntry error={errors.confirmPassword} />
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

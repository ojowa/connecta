import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { getPasswordStrength } from '../../utils/validators';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { Linking } from 'react-native';
import { DOBPicker } from '../../components/common/DOBPicker';

interface RegisterScreenProps { navigation: any; }

interface FormErrors {
  fullName?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENDERS = ['Male', 'Female'] as const;
const ISO_DOB_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoDob(iso: string): Date | null {
  if (!ISO_DOB_RE.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900) return null;
  const date = new Date(y, m - 1, d);
  if (date.getDate() !== d || date.getMonth() !== m - 1 || date.getFullYear() !== y) return null;
  return date;
}

function formatDobDisplay(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

const STRENGTH_COLORS = { weak: colors.error, medium: colors.warning, strong: colors.success };

function validate(values: {
  fullName: string; email: string; dateOfBirth: string; gender: string; password: string; confirmPassword: string; termsAccepted: boolean;
}): FormErrors {
  const errors: FormErrors = {};
  if (!values.fullName.trim()) errors.fullName = 'Full name is required';
  else if (values.fullName.trim().length < 2) errors.fullName = 'Name must be at least 2 characters';
  if (!values.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid email address';
  if (!values.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
  else {
    const dob = parseIsoDob(values.dateOfBirth);
    if (!dob) errors.dateOfBirth = 'Enter a valid date';
    else {
      const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) errors.dateOfBirth = 'You must be at least 18';
      else if (age > 120) errors.dateOfBirth = 'Enter a valid date';
    }
  }
  if (!values.gender) errors.gender = 'Select your gender';
  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 8) errors.password = 'At least 8 characters';
  else if (!/[A-Z]/.test(values.password) || !/[0-9]/.test(values.password)) errors.password = 'Include 1 uppercase and 1 number';
  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password';
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (!values.termsAccepted) errors.terms = 'You must accept the terms';
  return errors;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const { register, loading, error: authError } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const passwordStrength = password ? getPasswordStrength(password) : null;

  const handleRegister = async () => {
    const fieldErrors = validate({ fullName, email, dateOfBirth, gender, password, confirmPassword, termsAccepted });
    setErrors(fieldErrors);
    setSubmitted(true);
    if (Object.keys(fieldErrors).length > 0 || cooldown > 0) return;

    setServerError(null);
    try {
      await register({ email: email.trim(), password, fullName: fullName.trim(), dateOfBirth, gender: gender.toLowerCase().replace(/[- ]/g, '_') });
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'Registration failed';
      setServerError(msg);
      setCooldown(5);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      cooldownRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const updateField = (field: string, value: string) => {
    const updated = { fullName, email, dateOfBirth, gender, password, confirmPassword, termsAccepted };
    (updated as any)[field] = value;
    if (field === 'fullName') setFullName(value);
    else if (field === 'email') setEmail(value);
    else if (field === 'dateOfBirth') setDateOfBirth(value);
    else if (field === 'gender') setGender(value);
    else if (field === 'password') setPassword(value);
    else if (field === 'confirmPassword') setConfirmPassword(value);
    if (submitted) setErrors(validate(updated));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Find your perfect match</Text>

          <Input label="Full Name" placeholder="Enter your full name" value={fullName} onChangeText={(v) => updateField('fullName', v)} autoCapitalize="words" error={errors.fullName} />
          <Input label="Email" placeholder="Enter your email" value={email} onChangeText={(v) => updateField('email', v)} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
          <DOBPicker value={dateOfBirth} onChange={(v) => updateField('dateOfBirth', v)} error={errors.dateOfBirth} />

          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.genderRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderOption, gender === g && styles.genderSelected]}
                onPress={() => updateField('gender', g)}
                activeOpacity={0.7}
              >
                <Text style={[styles.genderText, gender === g && styles.genderTextSelected]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.gender && <Text style={styles.fieldError}>{errors.gender}</Text>}

          <Input label="Password" placeholder="Min 8 chars, 1 uppercase, 1 number" value={password} onChangeText={(v) => updateField('password', v)} secureTextEntry error={errors.password} />
          {passwordStrength && (
            <View style={styles.strengthRow}>
              <View style={[styles.strengthBar, { backgroundColor: STRENGTH_COLORS[passwordStrength] }]} />
              <Text style={[styles.strengthText, { color: STRENGTH_COLORS[passwordStrength] }]}>{passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}</Text>
            </View>
          )}

          <Input label="Confirm Password" placeholder="Confirm your password" value={confirmPassword} onChangeText={(v) => updateField('confirmPassword', v)} secureTextEntry error={errors.confirmPassword} />

          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setTermsAccepted(!termsAccepted)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink} onPress={() => Linking.openURL('https://ojchat.ng/terms')}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink} onPress={() => Linking.openURL('https://ojchat.ng/privacy')}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {errors.terms && <Text style={styles.fieldError}>{errors.terms}</Text>}

          {(authError || serverError) && <Text style={styles.error}>{authError || serverError}{cooldown > 0 ? ` (${cooldown}s)` : ''}</Text>}
          <Button title={cooldown > 0 ? `Try again in ${cooldown}s` : "Create Account"} onPress={handleRegister} loading={loading} disabled={cooldown > 0} style={styles.button} />
          <Button title="Already have an account? Sign In" variant="ghost" onPress={() => navigation.goBack()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1 },
  content: { padding: spacing.xl, paddingTop: spacing.md },
  title: { ...typography.h1, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  fieldLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.sm },
  genderRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  genderOption: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.input, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  genderSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  genderText: { ...typography.body, color: colors.textPrimary },
  genderTextSelected: { color: colors.white },
  fieldError: { ...typography.small, color: colors.error, marginBottom: spacing.sm },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md, marginTop: -spacing.sm },
  strengthBar: { height: 3, width: 40, borderRadius: 2 },
  strengthText: { ...typography.small, fontWeight: '600' },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm, marginTop: spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm, marginTop: 2 },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: colors.white, fontSize: 14, fontWeight: '700' },
  termsText: { ...typography.caption, color: colors.textSecondary, flex: 1, lineHeight: 20 },
  termsLink: { color: colors.primary, fontWeight: '600' },
  error: { ...typography.caption, color: colors.error, marginBottom: spacing.md },
  button: { marginTop: spacing.md },
});

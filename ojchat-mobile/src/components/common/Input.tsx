import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius } from '../../theme/borderRadius';
import { spacing } from '../../theme/spacing';

interface InputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  error?: string;
  style?: ViewStyle;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  returnKeyType?: 'done' | 'next' | 'go' | 'search';
  onSubmitEditing?: () => void;
  disabled?: boolean;
  showClear?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label, placeholder, value, onChangeText, secureTextEntry, multiline, error, style,
  keyboardType, autoCapitalize, maxLength, returnKeyType, onSubmitEditing, disabled, showClear,
}) => {
  const [focused, setFocused] = useState(false);
  const [secureVisible, setSecureVisible] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            focused && styles.focused,
            error && styles.errorBorder,
            multiline && styles.multiline,
            disabled && styles.inputDisabled,
            (showClear || secureTextEntry) && styles.inputWithAction,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.gray400}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !secureVisible}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          editable={!disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <View style={styles.actions}>
          {secureTextEntry && (
            <TouchableOpacity onPress={() => setSecureVisible(!secureVisible)} style={styles.actionButton}>
              <Text style={styles.actionText}>{secureVisible ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          )}
          {showClear && value.length > 0 && (
            <TouchableOpacity onPress={() => onChangeText('')} style={styles.actionButton}>
              <Text style={styles.actionClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {maxLength && !multiline && (
        <Text style={styles.charCount}>{value.length}/{maxLength}</Text>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  labelDisabled: { opacity: 0.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center' },
  input: { ...typography.body, flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.textPrimary, backgroundColor: colors.white },
  focused: { borderColor: colors.primary },
  errorBorder: { borderColor: colors.error },
  inputDisabled: { backgroundColor: colors.gray50, color: colors.gray400 },
  inputWithAction: { paddingRight: spacing.xl },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', position: 'absolute', right: spacing.sm },
  actionButton: { padding: spacing.xs },
  actionText: { fontSize: 16 },
  actionClear: { fontSize: 14, color: colors.gray400, fontWeight: '700' },
  charCount: { ...typography.small, color: colors.gray400, textAlign: 'right', marginTop: 2 },
  errorText: { ...typography.small, color: colors.error, marginTop: spacing.xs },
});

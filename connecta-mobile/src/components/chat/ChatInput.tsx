import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface ChatInputProps { onSend: (text: string) => void; onTyping?: () => void; }

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onTyping }) => {
  const [text, setText] = useState('');
  const handleSend = () => { if (text.trim()) { onSend(text.trim()); setText(''); } };
  return (
    <View style={styles.container}>
      <TextInput style={styles.input} value={text} onChangeText={(t) => { setText(t); onTyping?.(); }} placeholder="Type a message..." placeholderTextColor={colors.gray400} multiline />
      <TouchableOpacity style={[styles.sendButton, !text.trim() && styles.sendDisabled]} onPress={handleSend} disabled={!text.trim()}>
        <Text style={styles.sendText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
  input: { flex: 1, ...typography.body, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.input, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, maxHeight: 100, marginRight: spacing.sm },
  sendButton: { backgroundColor: colors.primary, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  sendDisabled: { opacity: 0.5 },
  sendText: { ...typography.button, color: colors.white },
});

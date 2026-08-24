import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { apiClient } from '../../services/api/apiClient';

interface ChatInputProps {
  onSend: (text: string) => void;
  onSendImage?: (uri: string) => void;
  onSendVoice?: (uri: string) => void;
  onSendGif?: (url: string) => void;
  onTyping?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onSendImage, onSendVoice, onSendGif, onTyping }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleAttach = async () => {
    Alert.alert('Attach', 'Choose an option', [
      {
        text: '📷 Camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') return;
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
          if (!result.canceled && result.assets[0]) onSendImage?.(result.assets[0].uri);
        },
      },
      {
        text: '🖼️ Gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') return;
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
          if (!result.canceled && result.assets[0]) onSendImage?.(result.assets[0].uri);
        },
      },
      {
        text: '🎤 Voice Message',
        onPress: () => {
          // Placeholder — in production, use expo-av to record
          Alert.alert('Voice', 'Voice recording coming soon');
        },
      },
      {
        text: '😎 GIF',
        onPress: () => {
          // Placeholder — in production, open GIF picker
          Alert.alert('GIF', 'GIF picker coming soon');
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.attachButton} onPress={handleAttach} activeOpacity={0.7}>
        <Text style={styles.attachIcon}>+</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={(t) => { setText(t); onTyping?.(); }}
        placeholder="Type a message..."
        placeholderTextColor={colors.gray400}
        multiline
      />
      <TouchableOpacity
        style={[styles.sendButton, !text.trim() && styles.sendDisabled]}
        onPress={handleSend}
        disabled={!text.trim()}
        activeOpacity={0.7}
      >
        <Text style={styles.sendIcon}>↑</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
  attachButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  attachIcon: { fontSize: 22, color: colors.primary, fontWeight: '700' },
  input: { flex: 1, ...typography.body, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.input, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, maxHeight: 100, marginRight: spacing.sm },
  sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.5 },
  sendIcon: { fontSize: 18, color: colors.white, fontWeight: '700' },
});

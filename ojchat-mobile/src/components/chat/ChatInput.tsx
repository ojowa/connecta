import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { CONFIG } from '../../constants/config';

interface ChatInputProps {
  onSend: (text: string) => void;
  onSendImage?: (uri: string) => void;
  onSendVoice?: (uri: string) => void;
  onSendGif?: (url: string) => void;
  onTyping?: () => void;
  replyTo?: { id: string; content: string } | null;
  onCancelReply?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onSendImage, onSendVoice, onSendGif, onTyping, replyTo, onCancelReply }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    const uri = recording.getURI();
    setRecording(null);
    if (uri && onSendVoice) onSendVoice(uri);
  };

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
        text: isRecording ? '⏹️ Stop Recording' : '🎤 Voice Message',
        onPress: isRecording ? stopRecording : startRecording,
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
      {replyTo && (
        <View style={styles.replyPreview}>
          <View style={styles.replyPreviewContent}>
            <Text style={styles.replyPreviewLabel}>Replying to</Text>
            <Text style={styles.replyPreviewText} numberOfLines={1}>{replyTo.content}</Text>
          </View>
          <TouchableOpacity onPress={onCancelReply}>
            <Ionicons name="close" size={18} color={colors.gray400} />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.inputRow}>
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
        maxLength={CONFIG.MAX_MESSAGE_LENGTH}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
  replyPreview: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, paddingBottom: 0, backgroundColor: colors.gray50 },
  replyPreviewContent: { flex: 1, marginLeft: spacing.xs },
  replyPreviewLabel: { ...typography.small, color: colors.primary, fontWeight: '600' },
  replyPreviewText: { ...typography.caption, color: colors.textSecondary },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.sm },
  attachButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  attachIcon: { fontSize: 22, color: colors.primary, fontWeight: '700' },
  input: { flex: 1, ...typography.body, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.input, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, maxHeight: 100, marginRight: spacing.sm },
  sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.5 },
  sendIcon: { fontSize: 18, color: colors.white, fontWeight: '700' },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { Message } from '../../types/chat';

interface ChatBubbleProps { message: Message; isOwn: boolean; }

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwn }) => (
  <View style={[styles.container, isOwn ? styles.own : styles.other]}>
    <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>{message.content}</Text>
    <Text style={styles.time}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { maxWidth: '80%', marginVertical: 4, padding: spacing.sm, borderRadius: borderRadius.lg },
  own: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  other: { alignSelf: 'flex-start', backgroundColor: colors.gray100, borderBottomLeftRadius: 4 },
  text: { ...typography.body },
  ownText: { color: colors.white },
  otherText: { color: colors.textPrimary },
  time: { ...typography.small, color: colors.gray400, marginTop: 4, alignSelf: 'flex-end' },
});

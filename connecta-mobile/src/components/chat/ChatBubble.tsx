import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { Message } from '../../types/chat';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

const STATUS_ICONS: Record<string, string> = {
  pending: '🕐',
  sent: '✓',
  delivered: '✓✓',
  read: '✓✓',
};

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwn, onReply, onDelete, onReact }) => {
  const [showActions, setShowActions] = useState(false);

  const handleLongPress = () => {
    setShowActions(true);
    const actions: any[] = [
      { text: 'Reply', onPress: () => onReply?.(message) },
      { text: 'React 😊', onPress: () => onReact?.(message.id, '😊') },
      { text: 'Cancel', style: 'cancel' },
    ];
    if (isOwn) {
      actions.splice(2, 0, { text: 'Delete', style: 'destructive', onPress: () => onDelete?.(message.id) });
    }
    Alert.alert('Message', '', actions);
  };

  const renderContent = () => {
    if (message.type === 'image' && message.content.startsWith('http')) {
      return <Image source={{ uri: message.content }} style={styles.image} resizeMode="cover" />;
    }
    if (message.type === 'gif' && message.content.startsWith('http')) {
      return <Image source={{ uri: message.content }} style={styles.image} resizeMode="cover" />;
    }
    if (message.type === 'voice') {
      return (
        <View style={styles.voiceContainer}>
          <Text style={[styles.voiceIcon, isOwn ? styles.ownText : styles.otherText]}>🎤</Text>
          <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>Voice message</Text>
        </View>
      );
    }
    if (message.type === 'video' && message.content.startsWith('http')) {
      return (
        <View style={styles.videoContainer}>
          <Image source={{ uri: message.content }} style={styles.image} resizeMode="cover" />
          <Text style={styles.playIcon}>▶️</Text>
        </View>
      );
    }
    return <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>{message.content}</Text>;
  };

  return (
    <TouchableOpacity onLongPress={handleLongPress} activeOpacity={0.8}>
      <View style={[styles.container, isOwn ? styles.own : styles.other]}>
        {renderContent()}
        {message.reactions && message.reactions.length > 0 && (
          <View style={styles.reactions}>
            {message.reactions.map((r, i) => (
              <Text key={i} style={styles.reaction}>{r.emoji}</Text>
            ))}
          </View>
        )}
        <View style={styles.footer}>
          <Text style={styles.time}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          {isOwn && <Text style={[styles.status, message.status === 'read' && styles.statusRead]}>{STATUS_ICONS[message.status] || '✓'}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { maxWidth: '80%', marginVertical: 4, padding: spacing.sm, borderRadius: borderRadius.card },
  own: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  other: { alignSelf: 'flex-start', backgroundColor: colors.gray100, borderBottomLeftRadius: 4 },
  text: { ...typography.body },
  ownText: { color: colors.white },
  otherText: { color: colors.textPrimary },
  image: { width: 200, height: 150, borderRadius: borderRadius.sm },
  voiceContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  voiceIcon: { fontSize: 20 },
  videoContainer: { position: 'relative' },
  playIcon: { position: 'absolute', alignSelf: 'center', top: '40%', fontSize: 32 },
  reactions: { flexDirection: 'row', gap: 2, marginTop: spacing.xs },
  reaction: { fontSize: 16 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.xs, marginTop: 4 },
  time: { ...typography.small, color: colors.gray400 },
  status: { ...typography.small, color: colors.gray400 },
  statusRead: { color: colors.primary },
});

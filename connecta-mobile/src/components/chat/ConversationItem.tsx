import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { Avatar } from '../common/Avatar';
import { useAppStore } from '../../store';
import { Conversation } from '../../types/chat';
import { formatRelativeTime } from '../../utils/dateUtils';

interface ConversationItemProps { conversation: Conversation; onPress: (id: string) => void; }

export const ConversationItem: React.FC<ConversationItemProps> = memo(({ conversation, onPress }) => {
  const currentUserId = useAppStore((s) => s.user?.id);
  const otherUserId = conversation.participantIds.find(id => id !== currentUserId) || '';
  const otherName = conversation.participantNames[otherUserId] || 'Unknown';
  const otherAvatar = conversation.participantAvatars[otherUserId];

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(conversation.id)} activeOpacity={0.7}>
      <Avatar uri={otherAvatar} size={56} />
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{otherName}</Text>
          {conversation.lastMessage && <Text style={styles.time}>{formatRelativeTime(conversation.lastMessage.createdAt)}</Text>}
        </View>
        {conversation.lastMessage && <Text style={styles.lastMessage} numberOfLines={1}>{conversation.lastMessage.content}</Text>}
      </View>
      {conversation.unreadCount > 0 && (
        <View style={styles.badge}><Text style={styles.badgeText}>{conversation.unreadCount}</Text></View>
      )}
    </TouchableOpacity>
  );
}, (prev, next) => prev.conversation.id === next.conversation.id && prev.conversation.unreadCount === next.conversation.unreadCount && prev.conversation.lastMessage?.content === next.conversation.lastMessage?.content);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  info: { flex: 1, marginLeft: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { ...typography.body, fontWeight: '600', flex: 1 },
  time: { ...typography.small, color: colors.gray400 },
  lastMessage: { ...typography.caption, color: colors.textSecondary },
  badge: { backgroundColor: colors.primary, borderRadius: borderRadius.full, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { ...typography.small, color: colors.white, fontWeight: '700' },
});

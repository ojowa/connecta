import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useConversations } from '../../hooks/useChat';
import { ChatList } from '../../components/chat/ChatList';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const ChatsScreen: React.FC = ({ navigation }: any) => {
  const { data, isLoading } = useConversations();
  if (isLoading) return <LoadingSpinner />;
  const conversations = data?.data?.data || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      {conversations.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>No conversations yet</Text><Text style={styles.emptySubtext}>Match with someone to start chatting</Text></View>
      ) : (
        <ChatList conversations={conversations} isLoading={isLoading} onConversationPress={(id) => navigation.navigate('Conversation', { conversationId: id })} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  title: { ...typography.h2, padding: spacing.md },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...typography.h3, marginBottom: spacing.xs },
  emptySubtext: { ...typography.body, color: colors.textSecondary },
});

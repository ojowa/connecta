import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConversations } from '../../hooks/useChat';
import { ChatList } from '../../components/chat/ChatList';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAppStore } from '../../store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const ChatsScreen: React.FC = ({ navigation }: any) => {
  const { data, isLoading, refetch } = useConversations();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) return <LoadingSpinner />;
  const conversations = data?.conversations || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      {conversations.length === 0 ? (
        <ScrollView style={styles.empty} contentContainerStyle={styles.emptyContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>Match with someone to start chatting</Text>
        </ScrollView>
      ) : (
        <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
          <ChatList conversations={conversations} isLoading={isLoading} onConversationPress={(id) => {
            const conv = conversations.find((c: any) => c.id === id);
            const currentUserId = useAppStore.getState().user?.id;
            const otherUserId = conv?.participantIds?.find((pid: string) => pid !== currentUserId) || '';
            const otherName = conv?.participantNames?.[otherUserId] || 'Unknown';
            const otherAvatar = conv?.participantAvatars?.[otherUserId];
            navigation.navigate('Conversation', { conversationId: id, otherUserId, otherName, otherAvatar });
          }} />
        </ScrollView>
      )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, backgroundColor: colors.white },
  title: { ...typography.h2, padding: spacing.md },
  empty: { flex: 1 },
  emptyContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { ...typography.h3, marginBottom: spacing.xs },
  emptySubtext: { ...typography.body, color: colors.textSecondary },
});

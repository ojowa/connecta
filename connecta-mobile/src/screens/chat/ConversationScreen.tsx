import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useMessages, useSendMessage } from '../../hooks/useChat';
import { ChatBubble } from '../../components/chat/ChatBubble';
import { ChatInput } from '../../components/chat/ChatInput';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAppStore } from '../../store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { Message } from '../../types/chat';

export const ConversationScreen: React.FC<{ route: any }> = ({ route }) => {
  const { conversationId } = route.params;
  const { data, isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const userId = useAppStore((s) => s.user?.id);
  const flatListRef = useRef<FlatList>(null);

  const messages = data?.data?.data || [];

  const handleSend = useCallback((content: string) => {
    sendMessage.mutate({ conversationId, content });
  }, [conversationId, sendMessage]);

  return (
    <View style={styles.container}>
      {isLoading ? <LoadingSpinner /> : (
        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()}
          keyExtractor={(item: Message) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} isOwn={item.senderId === userId} />}
          contentContainerStyle={styles.list}
          inverted
        />
      )}
      <ChatInput onSend={handleSend} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  list: { padding: spacing.md },
});

import React, { useRef, useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { useMessages, useSendMessage, useDeleteMessage, useReactToMessage } from '../../hooks/useChat';
import { ChatBubble } from '../../components/chat/ChatBubble';
import { ChatInput } from '../../components/chat/ChatInput';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ENDPOINTS } from '../../constants/endpoints';
import { useAppStore } from '../../store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { Message } from '../../types/chat';
import { apiClient } from '../../services/api/apiClient';

export const ConversationScreen: React.FC<{ route: any }> = ({ route }) => {
  const { conversationId } = route.params;
  const { data, isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const deleteMessage = useDeleteMessage(conversationId);
  const reactToMessage = useReactToMessage();
  const userId = useAppStore((s) => s.user?.id);
  const flatListRef = useRef<FlatList>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const messages = data?.data?.data || [];

  const handleSend = useCallback((content: string) => {
    sendMessage.mutate({ conversationId, content });
  }, [conversationId, sendMessage]);

  const handleSendImage = useCallback(async (uri: string) => {
    const formData = new FormData();
    formData.append('file', { uri, type: 'image/jpeg', name: 'photo.jpg' } as any);
    try {
      const uploadRes = await apiClient.post(ENDPOINTS.MEDIA.UPLOAD, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const imageUrl = uploadRes.data?.url || uploadRes.data?.data?.url;
      if (imageUrl) sendMessage.mutate({ conversationId, content: imageUrl, type: 'image' });
    } catch {}
  }, [conversationId, sendMessage]);

  const handleDelete = useCallback((messageId: string) => {
    deleteMessage.mutate(messageId);
  }, [deleteMessage]);

  const handleReact = useCallback((messageId: string, emoji: string) => {
    reactToMessage.mutate({ messageId, emoji });
  }, [reactToMessage]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      {isLoading ? <LoadingSpinner /> : (
        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()}
          keyExtractor={(item: Message) => item.id}
          renderItem={({ item }) => (
            <ChatBubble
              message={item}
              isOwn={item.senderId === userId}
              onDelete={handleDelete}
              onReact={handleReact}
            />
          )}
          contentContainerStyle={styles.list}
          inverted
          ListFooterComponent={
            typingUsers.length > 0 ? (
              <View style={styles.typingContainer}>
                <Text style={styles.typingText}>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</Text>
              </View>
            ) : null
          }
        />
      )}
      <ChatInput onSend={handleSend} onSendImage={handleSendImage} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  list: { padding: spacing.md },
  typingContainer: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  typingText: { ...typography.caption, color: colors.textSecondary, fontStyle: 'italic' },
});

import React, { useRef, useCallback, useState, useLayoutEffect, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { Message, CallEvent } from '../../types/chat';
import { apiClient } from '../../services/api/apiClient';

type FeedItem = Message | (CallEvent & { type: 'call'; senderId: string; conversationId: string; content: string });

const CALL_STATUS_TEXT: Record<string, { icon: string; label: string }> = {
  ringing: { icon: '📞', label: 'Call' },
  ended: { icon: '📞', label: 'Call ended' },
  rejected: { icon: '❌', label: 'Call declined' },
  active: { icon: '📞', label: 'Call ended' },
};

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function callsToMessages(calls: CallEvent[], userId: string): FeedItem[] {
  return calls.map((call) => {
    const isOutgoing = call.callerId === userId;
    const meta = CALL_STATUS_TEXT[call.status] || CALL_STATUS_TEXT.ended;
    const dur = formatDuration(call.duration);
    const typeLabel = call.callType === 'video' ? 'Video' : 'Voice';
    const content = `${meta.icon} ${typeLabel} ${isOutgoing ? 'to' : 'from'} ${isOutgoing ? 'them' : 'you'}${call.status === 'ended' ? ' · ' + dur : call.status === 'rejected' ? '' : ''}`;
    return {
      ...call,
      type: 'call' as const,
      senderId: isOutgoing ? call.callerId : call.calleeId,
      conversationId: '',
      content,
    };
  });
}

export const ConversationScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { conversationId, otherUserId = '', otherName = 'Chat', otherAvatar } = route.params || {};
  const { height: screenHeight } = useWindowDimensions();
  const keyboardOffset = Math.round(screenHeight * 0.1);
  const { data, isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const deleteMessage = useDeleteMessage(conversationId);
  const reactToMessage = useReactToMessage(conversationId);
  const userId = useAppStore((s) => s.user?.id);
  const flatListRef = useRef<FlatList>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [callEvents, setCallEvents] = useState<FeedItem[]>([]);

  useEffect(() => {
    if (!otherUserId) return;
    apiClient
      .get(ENDPOINTS.CALLS.PAIR_HISTORY(otherUserId))
      .then((res) => {
        const calls: CallEvent[] = res.data?.data || res.data || [];
        if (Array.isArray(calls) && calls.length > 0) {
          setCallEvents(callsToMessages(calls, userId || ''));
        }
      })
      .catch(() => {});
  }, [otherUserId, userId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: otherName,
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleVoiceCall}>
            <Text style={styles.headerButtonIcon}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleVideoCall}>
            <Text style={styles.headerButtonIcon}>📹</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, otherName, otherUserId]);

  const handleVoiceCall = useCallback(() => {
    navigation.navigate('ActiveVoiceCall', {
      callerId: otherUserId,
      callerName: otherName,
      callerAvatar: otherAvatar,
      callType: 'voice',
    });
  }, [navigation, otherUserId, otherName, otherAvatar]);

  const handleVideoCall = useCallback(() => {
    navigation.navigate('ActiveVideoCall', {
      callerId: otherUserId,
      callerName: otherName,
      callerAvatar: otherAvatar,
      callType: 'video',
    });
  }, [navigation, otherUserId, otherName, otherAvatar]);

  const messages = data?.messages || [];

  const feed: FeedItem[] = [...messages, ...callEvents].sort(
    (a, b) => new Date(b.createdAt || b.startedAt).getTime() - new Date(a.createdAt || a.startedAt).getTime(),
  );

  const handleSend = useCallback((content: string) => {
    sendMessage.mutate({ conversationId, content });
  }, [conversationId, sendMessage]);

  const handleSendImage = useCallback(async (uri: string) => {
    const formData = new FormData();
    formData.append('photo', { uri, type: 'image/jpeg', name: 'photo.jpg' } as any);
    try {
      const uploadRes = await apiClient.post(ENDPOINTS.MEDIA.UPLOAD, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const uploaded = uploadRes.data?.data || uploadRes.data;
      const imageUrl = uploaded?.url;
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={keyboardOffset}>
        {isLoading ? <LoadingSpinner /> : (
          <FlatList
            ref={flatListRef}
            data={feed}
            keyExtractor={(item: FeedItem) => item.id}
            renderItem={({ item }) => {
              if (item.type === 'call') {
                const callItem = item as CallEvent & { content: string };
                return (
                  <View style={styles.callEvent}>
                    <Text style={styles.callEventText}>{callItem.content}</Text>
                    <Text style={styles.callEventTime}>
                      {new Date(callItem.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                );
              }
              const msg = item as Message;
              return (
                <ChatBubble
                  message={msg}
                  isOwn={msg.senderId === userId}
                  onDelete={handleDelete}
                  onReact={handleReact}
                />
              );
            }}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  list: { padding: spacing.md },
  typingContainer: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  typingText: { ...typography.caption, color: colors.textSecondary, fontStyle: 'italic' },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  headerButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray100, justifyContent: 'center', alignItems: 'center' },
  headerButtonIcon: { fontSize: 18 },
  callEvent: { alignSelf: 'center', marginVertical: spacing.sm, alignItems: 'center' },
  callEventText: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  callEventTime: { ...typography.small, color: colors.gray400, marginTop: 2 },
});

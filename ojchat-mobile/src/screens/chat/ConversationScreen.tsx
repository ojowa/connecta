import React, { useRef, useCallback, useState, useLayoutEffect, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../navigation/types';
import {
  useMessages,
  useSendMessage,
  useDeleteMessage,
  useReactToMessage,
  useTypingIndicator,
} from '../../hooks/useChat';
import { useEnsureConversation } from '../../hooks/useEnsureConversation';
import { chatApi } from '../../services/api/chatApi';
import { ChatBubble } from '../../components/chat/ChatBubble';
import { ChatInput } from '../../components/chat/ChatInput';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { ENDPOINTS } from '../../constants/endpoints';
import { useAppStore } from '../../store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { Message, CallEvent } from '../../types/chat';
import { apiClient } from '../../services/api/apiClient';
import { matchApi } from '../../services/api/matchApi';
import { logger } from '../../utils/logger';

type FeedItem =
  | Message
  | (CallEvent & { type: 'call'; senderId: string; conversationId: string; content: string });

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

export const ConversationScreen: React.FC<RootStackScreenProps<'Conversation'>> = ({
  route,
  navigation,
}) => {
  const {
    conversationId: routeConversationId,
    otherUserId = '',
    otherName = 'Chat',
    otherAvatar,
  } = route.params || {};
  const [conversationId, setConversationId] = useState<string | undefined>(routeConversationId);
  const { height: screenHeight } = useWindowDimensions();
  const keyboardOffset = Math.round(screenHeight * 0.1);
  const { data, isLoading, isError, refetch } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const deleteMessage = useDeleteMessage(conversationId);
  const reactToMessage = useReactToMessage(conversationId);
  const userId = useAppStore((s) => s.user?.id);
  const flatListRef = useRef<FlatList>(null);
  const typingUsers = useTypingIndicator(conversationId);
  const [replyTo, setReplyTo] = useState<{ id: string; content: string } | null>(null);
  const [callEvents, setCallEvents] = useState<FeedItem[]>([]);
  const {
    ensureConversation,
    isEnsuring: isCreatingConversation,
    error: conversationError,
  } = useEnsureConversation();

  useEffect(() => {
    if (conversationId || !otherUserId) return;
    let cancelled = false;
    ensureConversation(otherUserId)
      .then((newId) => {
        if (!cancelled) setConversationId(newId);
      })
      .catch((err) => {
        if (!cancelled) {
          logger.warn('Failed to ensure conversation', { otherUserId, message: err?.message });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [otherUserId, conversationId, ensureConversation]);

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
      .catch((err) => {
        logger.warn('Failed to load call history', { otherUserId, message: err?.message });
      });
  }, [otherUserId, userId]);

  const showHeaderMenu = useCallback(() => {
    Alert.alert('Options', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'View Profile',
        onPress: () => navigation.navigate('UserProfile', { userId: otherUserId, isMatched: true }),
      },
      {
        text: 'Unmatch',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Unmatch', `Please use the Matches tab to unmatch ${otherName}.`, [
            { text: 'OK' },
          ]);
        },
      },
    ]);
  }, [navigation, otherName, otherUserId]);

  const handleVoiceCall = useCallback(() => {
    if (!conversationId) {
      Alert.alert('Connecting…', 'Waiting for the conversation to open. Try again in a moment.');
      return;
    }
    navigation.navigate('ActiveVoiceCall', {
      callerId: otherUserId,
      callerName: otherName,
      callerAvatar: otherAvatar,
      conversationId,
      callType: 'voice',
    });
  }, [navigation, otherUserId, otherName, otherAvatar, conversationId]);

  const handleVideoCall = useCallback(() => {
    if (!conversationId) {
      Alert.alert('Connecting…', 'Waiting for the conversation to open. Try again in a moment.');
      return;
    }
    navigation.navigate('ActiveVideoCall', {
      callerId: otherUserId,
      callerName: otherName,
      callerAvatar: otherAvatar,
      conversationId,
      callType: 'video',
    });
  }, [navigation, otherUserId, otherName, otherAvatar, conversationId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, !conversationId && styles.headerButtonDisabled]}
            onPress={handleVoiceCall}
            disabled={!conversationId}
            accessibilityLabel="Start voice call"
          >
            <Text style={styles.headerButtonIcon}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, !conversationId && styles.headerButtonDisabled]}
            onPress={handleVideoCall}
            disabled={!conversationId}
            accessibilityLabel="Start video call"
          >
            <Text style={styles.headerButtonIcon}>📹</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={showHeaderMenu}
            accessibilityLabel="More options"
          >
            <Text style={styles.headerButtonIcon}>⋮</Text>
          </TouchableOpacity>
        </View>
      ),
      headerTitle: () => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('UserProfile', { userId: otherUserId, isMatched: true })
          }
          style={styles.headerTitleContainer}
        >
          {otherAvatar ? <Image source={{ uri: otherAvatar }} style={styles.headerAvatar} /> : null}
          <Text style={styles.headerTitleText} numberOfLines={1}>
            {otherName}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [
    navigation,
    otherName,
    otherUserId,
    otherAvatar,
    showHeaderMenu,
    handleVoiceCall,
    handleVideoCall,
    conversationId,
  ]);

  const messages = data?.messages || [];

  const feed = useMemo<FeedItem[]>(() => {
    return [...messages, ...callEvents].sort((a, b) => {
      const aTime =
        'createdAt' in a
          ? new Date(a.createdAt).getTime()
          : 'startedAt' in a
            ? new Date(a.startedAt).getTime()
            : 0;
      const bTime =
        'createdAt' in b
          ? new Date(b.createdAt).getTime()
          : 'startedAt' in b
            ? new Date(b.startedAt).getTime()
            : 0;
      return bTime - aTime;
    });
  }, [messages, callEvents]);

  const handleSend = useCallback(
    (content: string) => {
      if (!conversationId) return;
      sendMessage.mutate({ conversationId, content });
    },
    [conversationId, sendMessage],
  );

  const handleSendVoice = useCallback(
    async (uri: string, duration?: number) => {
      if (!conversationId) return;
      try {
        const formData = new FormData();
        formData.append('file', { uri, type: 'audio/m4a', name: 'voice.m4a' } as any);
        const uploadRes = await apiClient.post(ENDPOINTS.MEDIA.UPLOAD, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const audioUrl = uploadRes?.data?.url || uploadRes?.data?.data?.url;
        if (audioUrl) {
          await sendMessage.mutateAsync({
            conversationId,
            content: audioUrl,
            type: 'voice',
            duration,
          });
        }
      } catch (err) {
        logger.error('Failed to send voice message', {
          message: err instanceof Error ? err.message : String(err),
        });
      }
    },
    [conversationId, sendMessage],
  );

  const handleSendImage = useCallback(
    async (uri: string) => {
      if (!conversationId) return;
      try {
        const formData = new FormData();
        formData.append('photo', { uri, type: 'image/jpeg', name: 'photo.jpg' } as any);
        const uploadRes = await apiClient.post(ENDPOINTS.MEDIA.UPLOAD, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const uploaded = uploadRes.data?.data || uploadRes.data;
        const imageUrl = uploaded?.url;
        if (imageUrl) sendMessage.mutate({ conversationId, content: imageUrl, type: 'image' });
      } catch (err) {
        logger.error('Failed to send image', {
          message: err instanceof Error ? err.message : String(err),
        });
      }
    },
    [conversationId, sendMessage],
  );

  const handleDelete = useCallback(
    (messageId: string) => {
      deleteMessage.mutate(messageId);
    },
    [deleteMessage],
  );

  const handleReact = useCallback(
    (messageId: string, emoji: string) => {
      reactToMessage.mutate({ messageId, emoji });
    },
    [reactToMessage],
  );

  const handleReply = useCallback((message: Message) => {
    setReplyTo({ id: message.id, content: message.content });
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const renderMessage = useCallback(
    ({ item }: { item: FeedItem }) => {
      if (item.type === 'call') {
        const callItem = item as CallEvent & { content: string };
        return (
          <View style={styles.callEvent}>
            <Text style={styles.callEventText}>{callItem.content}</Text>
            <Text style={styles.callEventTime}>
              {new Date(callItem.startedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
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
          onReply={handleReply}
        />
      );
    },
    [userId, handleDelete, handleReact, handleReply],
  );

  const renderBody = () => {
    if (isLoading || isCreatingConversation) return <LoadingSpinner />;
    if (isError) {
      return <ErrorState message="Couldn't load messages." onRetry={() => refetch()} />;
    }
    if (!conversationId) {
      return (
        <ErrorState
          message={conversationError || 'Opening conversation…'}
          onRetry={otherUserId ? () => ensureConversation(otherUserId) : undefined}
        />
      );
    }
    return (
      <FlatList
        ref={flatListRef}
        data={feed}
        keyExtractor={keyExtractor}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        inverted
        ListFooterComponent={
          typingUsers.length > 0 ? (
            <View style={styles.typingContainer}>
              <Text style={styles.typingText}>
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </Text>
            </View>
          ) : null
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardOffset}
      >
        {renderBody()}
        <ChatInput
          onSend={handleSend}
          onSendImage={handleSendImage}
          onSendVoice={handleSendVoice}
          onTyping={() => {
            if (conversationId) chatApi.sendTyping(conversationId);
          }}
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const keyExtractor = (item: FeedItem) => item.id;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  list: { padding: spacing.md },
  typingContainer: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  typingText: { ...typography.caption, color: colors.textSecondary, fontStyle: 'italic' },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonDisabled: { opacity: 0.4 },
  headerButtonIcon: { fontSize: 18 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerAvatar: { width: 28, height: 28, borderRadius: 14 },
  headerTitleText: { ...typography.body, fontWeight: '600', maxWidth: 180 },
  callEvent: { alignSelf: 'center', marginVertical: spacing.sm, alignItems: 'center' },
  callEventText: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  callEventTime: { ...typography.small, color: colors.gray400, marginTop: 2 },
});

import React, { useCallback } from 'react';
import { FlashList } from '@shopify/flash-list';
import { ConversationItem } from './ConversationItem';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Conversation } from '../../types/chat';

interface ChatListProps {
  conversations: Conversation[];
  isLoading: boolean;
  onConversationPress: (id: string) => void;
  onEndReached?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  conversations,
  isLoading,
  onConversationPress,
  onEndReached,
  refreshing,
  onRefresh,
}) => {
  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationItem conversation={item} onPress={onConversationPress} />
    ),
    [onConversationPress],
  );

  return (
    <FlashList
      data={conversations}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={isLoading ? <LoadingSpinner size="small" /> : null}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

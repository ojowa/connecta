import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

type NotificationType = 'match' | 'message' | 'like' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  subtitle: string;
  timestamp: string;
  read: boolean;
}

const TYPE_COLORS: Record<NotificationType, string> = {
  match: colors.primary,
  message: colors.secondary,
  like: colors.primary,
  system: colors.gray400,
};

const getIcon = (type: NotificationType): string => {
  switch (type) {
    case 'match':
      return '❤️';
    case 'message':
      return '💬';
    case 'like':
      return '👍';
    case 'system':
      return '⚙️';
  }
};

const NotificationsScreen: React.FC = () => {
  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/notifications').then((r) => r.data),
  });

  const queryClient = useQueryClient();
  const markAllMutation = useMutation({
    mutationFn: () => apiClient.put('/notifications/read', { markAs: 'all' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllAsRead = useCallback(() => {
    markAllMutation.mutate();
  }, [markAllMutation]);

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: TYPE_COLORS[item.type] + '20' }]}>
        <Text style={styles.iconText}>{getIcon(item.type)}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, !item.read && styles.unreadTitle]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {item.subtitle}
        </Text>
      </View>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🔔</Text>
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        When you get notifications, they'll show up here
      </Text>
    </View>
  );

  const renderHeader = () => (
    <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
      <Text style={styles.markAllText}>Mark all as read</Text>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyList : styles.listContent
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginLeft: spacing.sm,
  },
  badgeText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '700',
  },
  markAllButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  markAllText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  unreadItem: {
    backgroundColor: colors.primary + '08',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  timestamp: {
    ...typography.small,
    color: colors.gray400,
    marginLeft: spacing.sm,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 44 + spacing.md + spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
});

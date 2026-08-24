import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface BlockedUser {
  id: string;
  fullName: string;
  avatar?: string;
  blockedAt: string;
}

export default function BlockListScreen() {
  const queryClient = useQueryClient();
  const { data: blockedUsers = [], isLoading } = useQuery({
    queryKey: ['blockList'],
    queryFn: () => apiClient.get('/users/me/blocks').then((r) => r.data?.users || r.data || []),
  });

  const unblockMutation = useMutation({
    mutationFn: (userId: string) => apiClient.delete(`/users/${userId}/block`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockList'] });
      Alert.alert('Unblocked', 'User has been unblocked.');
    },
    onError: () => Alert.alert('Error', 'Failed to unblock user.'),
  });

  const handleUnblock = (user: BlockedUser) => {
    Alert.alert('Unblock', `Unblock ${user.fullName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Unblock', onPress: () => unblockMutation.mutate(user.id) },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {blockedUsers.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No Blocked Users</Text>
          <Text style={styles.emptySubtitle}>You haven't blocked anyone yet.</Text>
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <Avatar uri={item.avatar} size={44} />
              <Text style={styles.userName} numberOfLines={1}>{item.fullName}</Text>
              <Button title="Unblock" variant="ghost" onPress={() => handleUnblock(item)} style={styles.unblockButton} />
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.textSecondary },
  list: { padding: spacing.md },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  userName: { ...typography.body, flex: 1, marginLeft: spacing.md },
  unblockButton: { paddingHorizontal: spacing.sm },
});

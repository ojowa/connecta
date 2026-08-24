import React from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Device {
  deviceId: string;
  deviceType: string;
  deviceName: string;
  lastActiveAt: string;
  createdAt: string;
}

export default function DevicesScreen() {
  const queryClient = useQueryClient();
  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => apiClient.get('/auth/devices').then((r) => r.data?.devices || []),
  });

  const removeMutation = useMutation({
    mutationFn: (deviceId: string) => apiClient.delete(`/auth/devices/${deviceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      Alert.alert('Removed', 'Device has been removed.');
    },
    onError: () => Alert.alert('Error', 'Failed to remove device.'),
  });

  const handleRemove = (device: Device) => {
    Alert.alert('Remove Device', `Remove "${device.deviceName || device.deviceType}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMutation.mutate(device.deviceId) },
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
      <FlatList
        data={devices}
        keyExtractor={(item) => item.deviceId}
        renderItem={({ item }) => (
          <View style={styles.deviceRow}>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{item.deviceName || item.deviceType || 'Unknown device'}</Text>
              <Text style={styles.deviceMeta}>Last active: {new Date(item.lastActiveAt || item.createdAt).toLocaleDateString()}</Text>
            </View>
            <Button title="Remove" variant="ghost" onPress={() => handleRemove(item)} style={styles.removeButton} />
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No devices found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  list: { padding: spacing.md },
  deviceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  deviceInfo: { flex: 1 },
  deviceName: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  deviceMeta: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  removeButton: { paddingHorizontal: spacing.sm },
  emptyText: { ...typography.body, color: colors.textSecondary },
});

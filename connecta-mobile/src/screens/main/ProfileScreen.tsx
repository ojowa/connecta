import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../services/api/apiClient';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

export const ProfileScreen: React.FC = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/users/me/profile').then((r) => r.data),
  });

  const profile = profileData?.profile;
  const photos = profileData?.photos || [];
  const primaryPhoto = photos.find((p: any) => p.isPrimary) || photos[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Avatar uri={primaryPhoto?.url || user?.avatar} size={96} />
          <Text style={styles.name}>{user?.fullName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        </View>
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuLabel}>Edit Profile</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PhotoManager')}>
            <Text style={styles.menuIcon}>📷</Text>
            <Text style={styles.menuLabel}>Manage Photos</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Preferences')}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuLabel}>Discovery Preferences</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.menuIcon}>🔧</Text>
            <Text style={styles.menuLabel}>Settings</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        </View>
        <Button title="Log Out" variant="outline" onPress={logout} style={styles.logoutButton} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, backgroundColor: colors.white },
  header: { alignItems: 'center', paddingVertical: spacing.xxl },
  name: { ...typography.h2, marginTop: spacing.md },
  email: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  bio: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center', paddingHorizontal: spacing.xl },
  menu: { paddingHorizontal: spacing.lg },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  menuIcon: { fontSize: 20, marginRight: spacing.md, width: 28, textAlign: 'center' },
  menuLabel: { ...typography.body, flex: 1 },
  menuChevron: { fontSize: 22, color: colors.gray400 },
  logoutButton: { margin: spacing.xl },
});

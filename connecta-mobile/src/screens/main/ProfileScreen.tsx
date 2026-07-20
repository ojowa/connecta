import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const ProfileScreen: React.FC = ({ navigation }: any) => {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar uri={undefined} size={96} />
        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}><Text>Edit Profile</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PhotoManager')}><Text>Manage Photos</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}><Text>Settings</Text></TouchableOpacity>
      </View>
      <Button title="Log Out" variant="outline" onPress={logout} style={styles.logoutButton} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { alignItems: 'center', paddingVertical: spacing.xxl },
  name: { ...typography.h2, marginTop: spacing.md },
  email: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  menu: { paddingHorizontal: spacing.lg },
  menuItem: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  logoutButton: { margin: spacing.xl },
});

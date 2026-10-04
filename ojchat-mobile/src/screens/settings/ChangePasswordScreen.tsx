import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function ChangePasswordScreen({ navigation }: any) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!current || !newPass) return;
    if (newPass.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post(ENDPOINTS.AUTH.PASSWORD_CHANGE, {
        currentPassword: current,
        newPassword: newPass,
      });
      Alert.alert('Success', 'Password changed');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to change password. Check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Input
          label="Current Password"
          placeholder="Enter current password"
          value={current}
          onChangeText={setCurrent}
          secureTextEntry
        />
        <Input
          label="New Password"
          placeholder="Enter new password"
          value={newPass}
          onChangeText={setNewPass}
          secureTextEntry
        />
        <Input
          label="Confirm New Password"
          placeholder="Confirm new password"
          value={confirmPass}
          onChangeText={setConfirmPass}
          secureTextEntry
        />
        <Button title="Change Password" onPress={handleSave} loading={loading} style={styles.btn} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, padding: spacing.xl, backgroundColor: colors.white },
  btn: { marginTop: spacing.lg },
});

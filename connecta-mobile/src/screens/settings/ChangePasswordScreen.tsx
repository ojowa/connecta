import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { apiClient } from '../../services/api/apiClient';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function ChangePasswordScreen({ navigation }: any) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSave = async () => {
    if (!current || !newPass) return;
    setLoading(true);
    try {
      await apiClient.post('/auth/password/reset', { token: current, newPassword: newPass });
      Alert.alert('Success', 'Password changed');
      navigation.goBack();
    } catch { Alert.alert('Error', 'Failed to change password'); }
    finally { setLoading(false); }
  };
  return (
    <View style={styles.container}>
      <Input label="Current Password" value={current} onChangeText={setCurrent} secureTextEntry />
      <Input label="New Password" value={newPass} onChangeText={setNewPass} secureTextEntry />
      <Button title="Change Password" onPress={handleSave} loading={loading} style={styles.btn} />
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, padding: spacing.xl, backgroundColor: colors.white }, btn: { marginTop: spacing.lg } });

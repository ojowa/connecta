import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { apiClient } from '../../services/api/apiClient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function EditPhoneScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSave = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      await apiClient.patch('/users/me', { phone });
      Alert.alert('Success', 'Phone updated');
      navigation.goBack();
    } catch { Alert.alert('Error', 'Failed to update phone'); }
    finally { setLoading(false); }
  };
  return (
    <View style={styles.container}>
      <Input label="Phone Number" placeholder="+234..." value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Button title="Save" onPress={handleSave} loading={loading} style={styles.btn} />
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, padding: spacing.xl, backgroundColor: colors.white }, btn: { marginTop: spacing.lg } });

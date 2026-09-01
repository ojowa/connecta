import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
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
      await apiClient.patch(ENDPOINTS.USERS.ME, { phone });
      Alert.alert('Success', 'Phone updated');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update phone');
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Input
          label="Phone Number"
          placeholder="+234..."
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <Button title="Save" onPress={handleSave} loading={loading} style={styles.btn} />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, padding: spacing.xl, backgroundColor: colors.white },
  btn: { marginTop: spacing.lg },
});

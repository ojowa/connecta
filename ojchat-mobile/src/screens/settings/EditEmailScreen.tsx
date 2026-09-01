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

export default function EditEmailScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSave = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await apiClient.patch(ENDPOINTS.USERS.ME, { email });
      Alert.alert('Success', 'Email updated');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Input
          label="Email"
          placeholder="you@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
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

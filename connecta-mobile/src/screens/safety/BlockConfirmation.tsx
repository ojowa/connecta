import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface BlockConfirmationProps {
  route?: { params?: { userId: string; userName: string } };
  navigation?: any;
}

const BlockConfirmation: React.FC<BlockConfirmationProps> = ({
  route,
  navigation,
}) => {
  const { userId = '', userName = '' } = route?.params || {};
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    setLoading(true);
    try {
      await fetch(`/api/users/${userId}/block`, { method: 'POST' });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to block user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Block {userName}?</Text>
        <Text style={styles.body}>
          They won't be able to see your profile or message you.
        </Text>

        <View style={styles.actions}>
          <Button
            title={loading ? 'Blocking...' : 'Block'}
            onPress={handleBlock}
            disabled={loading}
            style={styles.blockButton}
          />
          {loading && <ActivityIndicator style={styles.loader} />}
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={styles.cancelButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  actions: {
    width: '100%',
  },
  blockButton: {
    backgroundColor: colors.error,
    marginBottom: spacing.md,
  },
  cancelButton: {
    borderColor: colors.gray300,
  },
  loader: {
    marginBottom: spacing.md,
  },
});

export default BlockConfirmation;

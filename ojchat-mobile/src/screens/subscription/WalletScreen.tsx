import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

const SuperLikeIcon: React.FC = () => (
  <View style={styles.iconContainer}>
    <Text style={styles.iconStar}>★</Text>
  </View>
);

const BoostIcon: React.FC = () => (
  <View style={styles.iconContainer}>
    <Text style={styles.iconBolt}>⚡</Text>
  </View>
);

const TransactionItem: React.FC<{ transaction: any }> = ({ transaction }) => {
  const typeColor =
    transaction.status === 'completed'
      ? colors.success
      : transaction.status === 'refunded'
        ? colors.warning
        : colors.textPrimary;

  return (
    <View style={styles.transactionRow}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{transaction.type}</Text>
        <Text style={styles.transactionDate}>{new Date(transaction.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: typeColor }]}>
        {transaction.amount} {transaction.currency}
      </Text>
    </View>
  );
};

const WalletScreen: React.FC = () => {
  const { data: walletData } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => apiClient.get('/payments/wallet').then((r) => r.data),
  });

  const { data: txnResponse } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => apiClient.get('/payments/transactions').then((r) => r.data),
  });

  const transactions = txnResponse?.transactions || [];

  const credits = walletData?.balance ?? 0;
  const hasActiveSubscription = !!walletData?.subscription;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wallet</Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>${(credits / 100).toFixed(2)}</Text>
          <Text style={styles.balanceUnit}>credits</Text>
        </View>

        <View style={styles.powerUpsRow}>
          <View style={styles.powerUpCard}>
            <SuperLikeIcon />
            <Text style={styles.powerUpLabel}>{hasActiveSubscription ? 'Active' : 'Free'}</Text>
            <Text style={styles.powerUpSublabel}>Subscription</Text>
          </View>
          <View style={styles.powerUpCard}>
            <BoostIcon />
            <Text style={styles.powerUpLabel}>{walletData?.currency || 'NGN'}</Text>
            <Text style={styles.powerUpSublabel}>Currency</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Transaction History</Text>
        <View style={styles.transactionSection}>
          {transactions.map((transaction: any) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    alignItems: 'center',
  },
  balanceLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 56,
  },
  balanceUnit: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  powerUpsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  powerUpCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconStar: {
    fontSize: 24,
    color: colors.warning,
  },
  iconBolt: {
    fontSize: 24,
    color: colors.secondary,
  },
  powerUpLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  powerUpSublabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  transactionSection: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    ...typography.body,
    color: colors.textPrimary,
  },
  transactionDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    ...typography.body,
    fontWeight: '600',
    marginLeft: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});

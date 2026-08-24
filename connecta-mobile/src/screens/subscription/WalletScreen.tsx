import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { apiClient } from '../../services/api/apiClient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface PurchaseOption {
  id: string;
  title: string;
  price: string;
  amount: number;
  currency: string;
  purpose: string;
  isBestValue?: boolean;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  type: 'purchase' | 'usage' | 'refund';
}

const FALLBACK_OPTIONS: PurchaseOption[] = [
  { id: 'sl10', title: '10 Super Likes', price: '$4.99', amount: 499, currency: 'USD', purpose: 'sl10' },
  { id: 'boost5', title: '5 Boosts', price: '$7.99', amount: 799, currency: 'USD', purpose: 'boost5' },
  { id: 'bundle', title: 'Bundle (15 Super Likes + 5 Boosts)', price: '$9.99', amount: 999, currency: 'USD', purpose: 'bundle', isBestValue: true },
];

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

const PurchaseCard: React.FC<{
  option: PurchaseOption;
  onBuy: () => void;
}> = ({ option, onBuy }) => (
  <TouchableOpacity
    style={[styles.purchaseCard, option.isBestValue && styles.purchaseCardBest]}
    onPress={onBuy}
    activeOpacity={0.7}
  >
    {option.isBestValue && (
      <View style={styles.bestValueBadge}>
        <Text style={styles.bestValueBadgeText}>Best Value</Text>
      </View>
    )}
    <Text style={styles.purchaseTitle}>{option.title}</Text>
    <Text style={styles.purchasePrice}>{option.price}</Text>
    <TouchableOpacity style={styles.buyButton} onPress={onBuy} activeOpacity={0.7}>
      <Text style={styles.buyButtonText}>Buy</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const typeColor =
    transaction.type === 'refund'
      ? colors.success
      : transaction.type === 'usage'
        ? colors.warning
        : colors.textPrimary;

  return (
    <View style={styles.transactionRow}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{transaction.description}</Text>
        <Text style={styles.transactionDate}>{transaction.date}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: typeColor }]}>
        {transaction.amount}
      </Text>
    </View>
  );
};

const WalletScreen: React.FC = () => {
  const { data: walletData } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => apiClient.get('/payments/wallet').then((r) => r.data),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => apiClient.get('/payments/transactions').then((r) => r.data),
  });

  const { data: purchaseOptions = FALLBACK_OPTIONS } = useQuery({
    queryKey: ['purchaseOptions'],
    queryFn: () => apiClient.get('/payments/options').then((r) => r.data?.options || r.data || FALLBACK_OPTIONS),
    staleTime: 5 * 60 * 1000,
  });

  const credits = walletData?.credits ?? 0;
  const superLikes = walletData?.superLikes ?? 0;
  const boosts = walletData?.boosts ?? 0;

  const queryClient = useQueryClient();
  const navigation = useNavigation<any>();

  const initPaymentMutation = useMutation({
    mutationFn: (option: PurchaseOption) => apiClient.post('/payments/initialize', {
      amount: option.amount,
      currency: option.currency,
      purpose: option.purpose,
    }),
    onSuccess: async (response) => {
      const authorizationUrl = response.data?.authorization_url || response.data?.data?.authorization_url;
      const reference = response.data?.reference || response.data?.data?.reference;
      if (authorizationUrl) {
        await Linking.openURL(authorizationUrl);
        Alert.alert(
          'Complete Payment',
          `Reference: ${reference}\n\nAfter completing payment, your balance will update automatically.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Payment', `Reference: ${reference}\n\nPayment initialized. Please check your email for the payment link.`);
      }
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to initialize payment. Please try again.');
    },
  });

  const handleBuy = (option: PurchaseOption) => {
    Alert.alert('Confirm Purchase', `Buy ${option.title} for ${option.price}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Buy', onPress: () => initPaymentMutation.mutate(option) },
    ]);
  };

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
          <Text style={styles.balanceAmount}>{credits}</Text>
          <Text style={styles.balanceUnit}>credits</Text>
        </View>

        <Text style={styles.sectionTitle}>Your Power-Ups</Text>
        <View style={styles.powerUpsRow}>
          <View style={styles.powerUpCard}>
            <SuperLikeIcon />
            <Text style={styles.powerUpCount}>{superLikes}</Text>
            <Text style={styles.powerUpLabel}>Super Likes</Text>
          </View>
          <View style={styles.powerUpCard}>
            <BoostIcon />
            <Text style={styles.powerUpCount}>{boosts}</Text>
            <Text style={styles.powerUpLabel}>Boosts</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Purchase</Text>
        {initPaymentMutation.isPending && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Processing payment...</Text>
          </View>
        )}
        <View style={styles.purchaseSection}>
          {purchaseOptions.map((option: PurchaseOption) => (
            <PurchaseCard
              key={option.id}
              option={option}
              onBuy={() => handleBuy(option)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Transaction History</Text>
        <View style={styles.transactionSection}>
          {transactions.map((transaction: Transaction) => (
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
  powerUpCount: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  powerUpLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  purchaseSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  purchaseCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  purchaseCardBest: {
    borderColor: colors.success,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.md,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  bestValueBadgeText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
  },
  purchaseTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  purchasePrice: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  buyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.button,
    alignItems: 'center',
  },
  buyButtonText: {
    ...typography.button,
    color: colors.white,
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

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

type PlanId = 'free' | 'premium' | 'gold' | 'platinum';

interface PlanFeature {
  label: string;
}

interface Plan {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  tagline: string;
  features: PlanFeature[];
  isPopular?: boolean;
}

const Checkmark: React.FC = () => (
  <Text style={styles.checkmark}>✓</Text>
);

const PlanCard: React.FC<{
  plan: any;
  isYearly: boolean;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ plan, isYearly, isSelected, onSelect }) => {
  const price = plan.price;
  const isFree = plan.planId === 'free';

  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        isSelected && styles.planCardSelected,
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {plan.isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>Most Popular</Text>
        </View>
      )}

      <Text style={styles.planName}>{plan.name}</Text>

      <View style={styles.priceRow}>
        <Text style={styles.priceCurrency}>$</Text>
        <Text style={styles.priceAmount}>
          {isFree ? '0' : price.toFixed(2)}
        </Text>
        <Text style={styles.pricePeriod}>/month</Text>
      </View>

      <Text style={styles.planTagline}>{plan.tagline}</Text>

      <View style={styles.featureList}>
        {(plan.features || []).map((feature: any, index: number) => (
          <View key={index} style={styles.featureRow}>
            <Checkmark />
            <Text style={styles.featureLabel}>{typeof feature === 'string' ? feature : feature.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.subscribeButton,
          isSelected ? styles.subscribeButtonPrimary : styles.subscribeButtonOutline,
        ]}
        onPress={onSelect}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.subscribeButtonText,
            isSelected ? styles.subscribeButtonTextPrimary : styles.subscribeButtonTextOutline,
          ]}
        >
          {isSelected ? 'Current Plan' : 'Subscribe'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const SubscriptionScreen: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const { data: plansData, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => apiClient.get('/payments/plans').then((r) => r.data?.data?.plans || r.data?.plans || []),
  });

  const subscribeMutation = useMutation({
    mutationFn: (planId: string) => apiClient.post('/payments/subscribe', {
      planId,
      billingPeriod: isYearly ? 'yearly' : 'monthly',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      Alert.alert('Success', 'You are now subscribed!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to subscribe. Please try again.');
    },
  });

  const plans = plansData || [];

  const handleSubscribe = () => {
    if (!selectedPlan) { Alert.alert('Select a plan', 'Please choose a plan first.'); return; }
    subscribeMutation.mutate(selectedPlan);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Choose Your Plan</Text>
          <Text style={styles.headerSubtitle}>
            Unlock premium features to find your perfect match
          </Text>
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleOption, !isYearly && styles.toggleOptionActive]}
            onPress={() => setIsYearly(false)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.toggleText, !isYearly && styles.toggleTextActive]}
            >
              Monthly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleOption, isYearly && styles.toggleOptionActive]}
            onPress={() => setIsYearly(true)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.toggleText, isYearly && styles.toggleTextActive]}
            >
              Yearly
            </Text>
            {isYearly && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>Save 20%</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {plans.map((plan: any) => (
          <PlanCard
            key={plan.planId}
            plan={plan}
            isYearly={isYearly}
            isSelected={selectedPlan === plan.planId}
            onSelect={() => setSelectedPlan(plan.planId)}
          />
        ))}

        <TouchableOpacity
          style={[styles.subscribeNowButton, !selectedPlan && styles.subscribeNowButtonDisabled]}
          onPress={handleSubscribe}
          disabled={!selectedPlan || subscribeMutation.isPending}
          activeOpacity={0.7}
        >
          <Text style={styles.subscribeNowButtonText}>
            {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe Now'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubscriptionScreen;

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
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.button,
    padding: spacing.xs,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.button - 2,
  },
  toggleOptionActive: {
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.textPrimary,
  },
  discountBadge: {
    marginLeft: spacing.xs,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  discountBadgeText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  planCardSelected: {
    borderColor: colors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    zIndex: 1,
  },
  popularBadgeText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
  },
  planName: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  priceCurrency: {
    ...typography.h2,
    color: colors.primary,
  },
  priceAmount: {
    ...typography.h1,
    color: colors.primary,
    fontSize: 32,
  },
  pricePeriod: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  planTagline: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  featureList: {
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkmark: {
    fontSize: 16,
    color: colors.success,
    fontWeight: '600',
    marginRight: spacing.sm,
    width: 20,
  },
  featureLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  subscribeButton: {
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.button,
    alignItems: 'center',
  },
  subscribeButtonPrimary: {
    backgroundColor: colors.primary,
  },
  subscribeButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  subscribeButtonText: {
    ...typography.button,
  },
  subscribeButtonTextPrimary: {
    color: colors.white,
  },
  subscribeButtonTextOutline: {
    color: colors.primary,
  },
  subscribeNowButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  subscribeNowButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  subscribeNowButtonText: {
    ...typography.button,
    color: colors.white,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});

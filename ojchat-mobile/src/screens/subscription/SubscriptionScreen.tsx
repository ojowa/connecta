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
import { ENDPOINTS } from '../../constants/endpoints';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { Ionicons } from '@expo/vector-icons';

interface PlanFeature {
  label: string;
}

interface PlanData {
  planId: string;
  name: string;
  displayName: string;
  tagline: string;
  price: number;
  currency: string;
  features: (PlanFeature | string)[];
  isPopular?: boolean;
  isFree?: boolean;
}

const PlanCard: React.FC<{
  plan: PlanData;
  isYearly: boolean;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ plan, isYearly, isSelected, onSelect }) => {
  const isFree = plan.isFree || plan.planId === 'free';
  const price = isFree ? 0 : plan.price || 0;

  const formatPrice = (amount: number, currency: string) => {
    if (currency === 'NGN') return `₦${amount.toLocaleString()}`;
    if (currency === 'USD') return `$${amount.toFixed(2)}`;
    return `${currency} ${amount.toFixed(2)}`;
  };

  return (
    <TouchableOpacity
      style={[styles.planCard, isSelected && styles.planCardSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {plan.isPopular && (
        <View style={styles.popularBadge}>
          <Ionicons name="star" size={12} color={colors.white} />
          <Text style={styles.popularBadgeText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan.displayName || plan.name}</Text>
        {plan.tagline && <Text style={styles.planTagline}>{plan.tagline}</Text>}
      </View>

      <View style={styles.priceRow}>
        {isFree ? (
          <Text style={styles.priceAmount}>Free</Text>
        ) : (
          <>
            <Text style={styles.priceAmount}>{formatPrice(price, plan.currency || 'NGN')}</Text>
            <Text style={styles.pricePeriod}>/month</Text>
          </>
        )}
      </View>

      <View style={styles.featureList}>
        {(plan.features || []).map((feature: any, index: number) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.featureLabel}>
              {typeof feature === 'string' ? feature : feature.label}
            </Text>
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
          {isSelected ? 'Current Plan' : isFree ? 'Free Plan' : 'Select Plan'}
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

  const {
    data: plansData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['plans'],
    queryFn: () =>
      apiClient
        .get(ENDPOINTS.SUBSCRIPTIONS.PLANS)
        .then((r) => r.data?.data?.plans || r.data?.plans || []),
  });

  const subscribeMutation = useMutation({
    mutationFn: (planId: string) =>
      apiClient.post(ENDPOINTS.SUBSCRIPTIONS.SUBSCRIBE, {
        planId,
        billingPeriod: isYearly ? 'yearly' : 'monthly',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['planInfo'] });
      Alert.alert('Success', 'You are now subscribed!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to subscribe. Please try again.');
    },
  });

  const plans: PlanData[] = plansData || [];
  const sortedPlans = [...plans].sort((a, b) => {
    if (a.isFree && !b.isFree) return -1;
    if (!a.isFree && b.isFree) return 1;
    return (a.price || 0) - (b.price || 0);
  });

  const handleSubscribe = () => {
    if (!selectedPlan) {
      Alert.alert('Select a plan', 'Please choose a plan first.');
      return;
    }
    subscribeMutation.mutate(selectedPlan);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {isError ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text
            style={{
              ...typography.body,
              color: colors.textSecondary,
              textAlign: 'center',
              padding: spacing.lg,
            }}
          >
            Couldn't load plans. Pull to retry.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{ alignSelf: 'center', padding: spacing.md }}
          >
            <Text style={{ ...typography.body, color: colors.primary, fontWeight: '600' }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Choose Your Plan</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <Text style={styles.headerSubtitle}>
            Unlock premium features to find your perfect match
          </Text>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleOption, !isYearly && styles.toggleOptionActive]}
              onPress={() => setIsYearly(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, !isYearly && styles.toggleTextActive]}>Monthly</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleOption, isYearly && styles.toggleOptionActive]}
              onPress={() => setIsYearly(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, isYearly && styles.toggleTextActive]}>Yearly</Text>
              {isYearly && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>Save 20%</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {sortedPlans.map((plan) => (
            <PlanCard
              key={plan.planId || plan.name}
              plan={plan}
              isYearly={isYearly}
              isSelected={selectedPlan === plan.planId}
              onSelect={() => setSelectedPlan(plan.planId)}
            />
          ))}

          {selectedPlan && sortedPlans.find((p) => p.planId === selectedPlan && !p.isFree) && (
            <TouchableOpacity
              style={[styles.subscribeNowButton]}
              onPress={handleSubscribe}
              disabled={subscribeMutation.isPending}
              activeOpacity={0.7}
            >
              <Text style={styles.subscribeNowButtonText}>
                {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe Now'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
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
    top: -12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    zIndex: 1,
    gap: 4,
  },
  popularBadgeText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
  },
  planHeader: {
    marginBottom: spacing.sm,
  },
  planName: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  planTagline: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
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
  featureList: {
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
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
  subscribeNowButtonText: {
    ...typography.button,
    color: colors.white,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});

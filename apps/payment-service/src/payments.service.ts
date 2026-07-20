import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan, Subscription, Transaction, User } from '@app/common/entities';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Plan) private planRepo: Repository<Plan>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    @InjectRepository(Transaction) private txnRepo: Repository<Transaction>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getPlans(country?: string, currency?: string) {
    const plans = await this.planRepo.find({ where: { isActive: true }, order: { sortOrder: 'ASC' } });
    return { plans: plans.map(p => ({ planId: p.id, name: p.displayName, price: p.priceMonthly, currency: p.currency, interval: 'month', features: p.features, limits: { dailyLikes: p.dailyLikes, superLikesPerDay: p.dailySuperLikes } })) };
  }

  async subscribe(userId: string, data: any) {
    const plan = await this.planRepo.findOne({ where: { id: data.planId } });
    if (!plan) throw new BadRequestException('Invalid plan');
    const existing = await this.subRepo.findOne({ where: { userId, status: 'active' } });
    if (existing) throw new BadRequestException('Already subscribed');
    const now = new Date();
    const periodEnd = new Date(now);
    if (data.billingPeriod === 'yearly') periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    else periodEnd.setMonth(periodEnd.getMonth() + 1);
    const sub = await this.subRepo.save(this.subRepo.create({ userId, planId: plan.id, status: 'active', billingPeriod: data.billingPeriod || 'monthly', startedAt: now, currentPeriodStart: now, currentPeriodEnd: periodEnd, autoRenew: true }));
    const txn = await this.txnRepo.save(this.txnRepo.create({ userId, subscriptionId: sub.id, type: 'subscription', amount: data.billingPeriod === 'yearly' ? plan.priceYearly : plan.priceMonthly, currency: plan.currency, status: 'completed', paymentMethod: data.paymentMethod, gateway: 'paystack' }));
    await this.userRepo.update(userId, { role: 'premium' as any });
    return { subscription: { subscriptionId: sub.id, planId: plan.id, planName: plan.displayName, status: 'active', price: plan.priceMonthly, currency: plan.currency, interval: sub.billingPeriod, currentPeriodStart: sub.currentPeriodStart, currentPeriodEnd: sub.currentPeriodEnd, payment: { transactionId: txn.id, status: 'successful', paymentMethod: data.paymentMethod } } };
  }

  async cancelSubscription(userId: string, data: any) {
    const sub = await this.subRepo.findOne({ where: { userId, status: 'active' } });
    if (!sub) throw new NotFoundException('No active subscription');
    await this.subRepo.update(sub.id, { status: 'cancelled', cancelledAt: new Date(), autoRenew: false });
    return { subscriptionId: sub.id, status: 'active_until_period_end', currentPeriodEnd: sub.currentPeriodEnd, refundEligible: false };
  }

  async upgradePlan(userId: string, data: any) {
    const sub = await this.subRepo.findOne({ where: { userId, status: 'active' } });
    if (!sub) throw new NotFoundException('No active subscription');
    const newPlan = await this.planRepo.findOne({ where: { id: data.newPlanId } });
    if (!newPlan) throw new BadRequestException('Invalid plan');
    const previousPlanId = sub.planId;
    await this.subRepo.update(sub.id, { planId: newPlan.id });
    return { subscription: { subscriptionId: sub.id, previousPlan: previousPlanId, newPlan: newPlan.id, status: 'active', effectiveDate: new Date() } };
  }

  async initializePayment(userId: string, data: any) {
    const ref = `CKA-TXN-${Date.now()}`;
    const txn = await this.txnRepo.save(this.txnRepo.create({ userId, type: data.metadata?.product || 'one_time', amount: data.amount, currency: data.currency || 'NGN', status: 'pending', metadata: data.metadata }));
    return { transactionId: txn.id, amount: data.amount, currency: data.currency || 'NGN', status: 'pending', reference: ref, expiresAt: new Date(Date.now() + 30 * 60 * 1000) };
  }

  async verifyPayment(userId: string, reference: string) {
    const txn = await this.txnRepo.findOne({ where: { id: reference } });
    if (!txn) throw new BadRequestException('Invalid reference');
    if (txn.status === 'completed') throw new BadRequestException('Payment already verified');
    await this.txnRepo.update(txn.id, { status: 'completed', completedAt: new Date() });
    return { transactionId: txn.id, reference, status: 'successful', amount: txn.amount, currency: txn.currency, verifiedAt: new Date() };
  }

  async getPaymentHistory(userId: string, page = 1, limit = 20) {
    const [transactions, total] = await this.txnRepo.findAndCount({ where: { userId }, order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit });
    return { transactions, meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async requestRefund(userId: string, transactionId: string, data: any) {
    const txn = await this.txnRepo.findOne({ where: { id: transactionId, userId } });
    if (!txn) throw new NotFoundException('Transaction not found');
    return { refundId: 'ref_' + Date.now(), transactionId, status: 'pending_review', estimatedResolution: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) };
  }
}

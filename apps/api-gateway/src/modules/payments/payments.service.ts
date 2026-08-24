import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Plan, Subscription, Transaction, User } from '@app/common/entities';
import { PAYMENT_EVENTS } from '@app/common/constants/events';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Plan) private planRepo: Repository<Plan>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    @InjectRepository(Transaction) private txnRepo: Repository<Transaction>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getPlans(country?: string, currency?: string) {
    const plans = await this.planRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
    return {
      plans: plans.map((p) => ({
        planId: p.id,
        name: p.displayName,
        price: p.priceMonthly,
        currency: p.currency,
        interval: 'month',
        features: p.features,
        limits: { dailyLikes: p.dailyLikes, superLikesPerDay: p.dailySuperLikes },
      })),
    };
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
    const sub = await this.subRepo.save(
      this.subRepo.create({
        userId,
        planId: plan.id,
        status: 'active',
        billingPeriod: data.billingPeriod || 'monthly',
        startedAt: now,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        autoRenew: true,
      }),
    );
    const txn = await this.txnRepo.save(
      this.txnRepo.create({
        userId,
        subscriptionId: sub.id,
        type: 'subscription',
        amount: data.billingPeriod === 'yearly' ? plan.priceYearly : plan.priceMonthly,
        currency: plan.currency,
        status: 'completed',
        paymentMethod: data.paymentMethod,
        gateway: 'paystack',
      }),
    );

    this.eventEmitter.emit(PAYMENT_EVENTS.SUBSCRIPTION_ACTIVATED, {
      subscriptionId: sub.id,
      userId,
      planId: plan.id,
      planName: plan.displayName,
      billingPeriod: sub.billingPeriod,
    });
    this.eventEmitter.emit(PAYMENT_EVENTS.PAYMENT_SUCCESSFUL, {
      transactionId: txn.id,
      userId,
      amount: txn.amount,
      currency: txn.currency,
    });

    return {
      subscription: {
        subscriptionId: sub.id,
        planId: plan.id,
        planName: plan.displayName,
        status: 'active',
        price: plan.priceMonthly,
        currency: plan.currency,
        interval: sub.billingPeriod,
        currentPeriodStart: sub.currentPeriodStart,
        currentPeriodEnd: sub.currentPeriodEnd,
        payment: { transactionId: txn.id, status: 'successful', paymentMethod: data.paymentMethod },
      },
    };
  }

  async cancelSubscription(userId: string, data: any) {
    const sub = await this.subRepo.findOne({ where: { userId, status: 'active' } });
    if (!sub) throw new NotFoundException('No active subscription');
    await this.subRepo.update(sub.id, {
      status: 'cancelled',
      cancelledAt: new Date(),
      autoRenew: false,
    });

    this.eventEmitter.emit(PAYMENT_EVENTS.SUBSCRIPTION_CANCELLED, {
      subscriptionId: sub.id,
      userId,
      planId: sub.planId,
    });

    return {
      subscriptionId: sub.id,
      status: 'active_until_period_end',
      currentPeriodEnd: sub.currentPeriodEnd,
      refundEligible: false,
    };
  }

  async upgradePlan(userId: string, data: any) {
    const sub = await this.subRepo.findOne({ where: { userId, status: 'active' } });
    if (!sub) throw new NotFoundException('No active subscription');
    const newPlan = await this.planRepo.findOne({ where: { id: data.newPlanId } });
    if (!newPlan) throw new BadRequestException('Invalid plan');
    const previousPlanId = sub.planId;
    await this.subRepo.update(sub.id, { planId: newPlan.id });
    return {
      subscription: {
        subscriptionId: sub.id,
        previousPlan: previousPlanId,
        newPlan: newPlan.id,
        status: 'active',
        effectiveDate: new Date(),
      },
    };
  }

  async initializePayment(userId: string, data: any) {
    const amountKobo = Math.round(parseFloat(data.amount) * 100); // Paystack uses kobo
    const ref = `CKA-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const txn = await this.txnRepo.save(
      this.txnRepo.create({
        userId,
        type: data.purpose || 'one_time',
        amount: amountKobo,
        currency: data.currency || 'NGN',
        status: 'pending',
        gateway: 'paystack',
        reference: ref,
        metadata: data.metadata,
      }),
    );

    // In production, call Paystack API:
    // const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);
    // const result = await paystack.initializeTransaction({ email, amount: amountKobo, reference: ref, callback_url, metadata });

    return {
      transactionId: txn.id,
      authorization_url: `https://checkout.paystack.com/${ref}`, // placeholder
      reference: ref,
      amount: data.amount,
      currency: data.currency || 'NGN',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
  }

  async verifyPayment(userId: string, reference: string) {
    const txn = await this.txnRepo.findOne({ where: { reference } });
    if (!txn) throw new BadRequestException('Invalid reference');
    if (txn.status === 'completed') throw new BadRequestException('Payment already verified');

    // In production, verify with Paystack:
    // const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);
    // const verification = await paystack.verifyTransaction(reference);
    // if (verification.data.status !== 'success') throw new BadRequestException('Payment not successful');

    await this.txnRepo.update(txn.id, {
      status: 'completed',
      completedAt: new Date(),
      gatewayResponse: JSON.stringify({
        verified: true,
        verifiedAt: new Date().toISOString(),
      }) as any,
    });

    this.eventEmitter.emit(PAYMENT_EVENTS.PAYMENT_SUCCESSFUL, {
      transactionId: txn.id,
      userId,
      amount: txn.amount,
      currency: txn.currency,
    });

    return {
      transactionId: txn.id,
      reference,
      status: 'successful',
      amount: txn.amount / 100,
      currency: txn.currency,
      verifiedAt: new Date(),
    };
  }

  async getPaymentHistory(userId: string, page = 1, limit = 20) {
    const [transactions, total] = await this.txnRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { transactions, meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async requestRefund(userId: string, transactionId: string, data: any) {
    const txn = await this.txnRepo.findOne({ where: { id: transactionId, userId } });
    if (!txn) throw new NotFoundException('Transaction not found');
    if (txn.status !== 'completed')
      throw new BadRequestException('Can only refund completed transactions');

    // In production, initiate refund via Paystack:
    // const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);
    // await paystack.refundTransaction({ transaction: txn.gatewayReference, amount: txn.amount, reason: data.reason });

    await this.txnRepo.update(txn.id, { status: 'refunded' });

    return {
      refundId: `ref_${Date.now()}`,
      transactionId,
      amount: txn.amount / 100,
      currency: txn.currency,
      status: 'processing',
      reason: data.reason || 'Customer requested refund',
      estimatedResolution: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  async handleWebhook(payload: any, signature: string) {
    // In production, verify Paystack webhook signature:
    // const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(payload)).digest('hex');
    // if (hash !== signature) throw new BadRequestException('Invalid webhook signature');

    const { event, data } = payload;
    if (event === 'charge.success') {
      const txn = await this.txnRepo.findOne({ where: { reference: data.reference } });
      if (txn && txn.status === 'pending') {
        await this.txnRepo.update(txn.id, { status: 'completed', completedAt: new Date() });
      }
    }
    return { received: true };
  }

  async getWallet(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const sub = await this.subRepo.findOne({ where: { userId, status: 'active' } });
    const completedTxns = await this.txnRepo.find({
      where: { userId, status: 'completed' },
      order: { createdAt: 'DESC' },
      take: 10,
    });
    return {
      balance: (user as any).walletBalance || 0,
      currency: 'NGN',
      subscription: sub ? { planId: sub.planId, status: sub.status, expiresAt: sub.currentPeriodEnd } : null,
      recentTransactions: completedTxns.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount / 100,
        currency: t.currency,
        status: t.status,
        createdAt: t.createdAt,
      })),
    };
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const [transactions, total] = await this.txnRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount / 100,
        currency: t.currency,
        status: t.status,
        reference: t.reference,
        paymentMethod: t.paymentMethod,
        createdAt: t.createdAt,
      })),
      meta: { page, limit, total, hasMore: total > page * limit },
    };
  }

  async getPaymentOptions(userId: string) {
    return {
      methods: [
        { id: 'card', name: 'Credit/Debit Card', enabled: true, icon: 'credit-card' },
        { id: 'bank_transfer', name: 'Bank Transfer', enabled: true, icon: 'bank' },
        { id: 'ussd', name: 'USSD', enabled: true, icon: 'phone' },
        { id: 'mobile_money', name: 'Mobile Money', enabled: false, icon: 'smartphone' },
      ],
      currencies: ['NGN', 'GHS', 'KES', 'ZAR'],
      defaultCurrency: 'NGN',
    };
  }
}

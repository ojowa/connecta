import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, Transaction, Plan, User, Notification } from '@app/common/entities';
import { PAYMENT_EVENTS } from '@app/common/constants/events';

@Injectable()
export class PaymentEventsHandler {
  private readonly logger = new Logger('PaymentEventsHandler');

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async handlePaymentSuccessful(payload: {
    transactionId: string;
    userId: string;
    amount: number;
    currency: string;
  }) {
    this.logger.log(`Handling payment.successful for ${payload.userId}`);

    const transaction = await this.transactionRepository.findOne({
      where: { id: payload.transactionId },
    });

    if (transaction) {
      await this.transactionRepository.update(payload.transactionId, {
        status: 'completed',
        completedAt: new Date(),
      });
    }

    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: payload.userId,
        type: 'payment_success',
        title: 'Payment Successful',
        body: `Your payment of ${payload.currency} ${payload.amount} was successful.`,
        data: { transactionId: payload.transactionId },
        status: 'sent',
        sentAt: new Date(),
      }),
    );
  }

  async handlePaymentFailed(payload: { transactionId: string; userId: string; reason: string }) {
    this.logger.log(`Handling payment.failed for ${payload.userId}`);

    await this.transactionRepository.update(payload.transactionId, {
      status: 'failed',
    });

    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: payload.userId,
        type: 'payment_failed',
        title: 'Payment Failed',
        body: `Your payment could not be processed. Reason: ${payload.reason}`,
        data: { transactionId: payload.transactionId },
        status: 'sent',
        sentAt: new Date(),
      }),
    );
  }

  async handleSubscriptionActivated(payload: {
    subscriptionId: string;
    userId: string;
    planId: string;
  }) {
    this.logger.log(`Handling subscription.activated for ${payload.userId}`);

    const plan = await this.planRepository.findOne({
      where: { id: payload.planId },
    });

    if (plan) {
      await this.notificationRepository.save(
        this.notificationRepository.create({
          userId: payload.userId,
          type: 'system',
          title: 'Subscription Activated',
          body: `Your ${plan.name} subscription is now active. Enjoy your premium features!`,
          data: { subscriptionId: payload.subscriptionId, planId: payload.planId },
          status: 'sent',
          sentAt: new Date(),
        }),
      );
    }
  }

  async handleSubscriptionExpired(payload: { subscriptionId: string; userId: string }) {
    this.logger.log(`Handling subscription.expired for ${payload.userId}`);

    await this.subscriptionRepository.update(payload.subscriptionId, {
      status: 'expired',
    });

    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: payload.userId,
        type: 'subscription_expiring',
        title: 'Subscription Expired',
        body: 'Your subscription has expired. Renew to continue enjoying premium features.',
        data: { subscriptionId: payload.subscriptionId },
        status: 'sent',
        sentAt: new Date(),
      }),
    );
  }

  async handleSubscriptionRenewed(payload: {
    subscriptionId: string;
    userId: string;
    newEndDate: Date;
  }) {
    this.logger.log(`Handling subscription.renewed for ${payload.userId}`);

    await this.subscriptionRepository.update(payload.subscriptionId, {
      status: 'active',
      currentPeriodEnd: payload.newEndDate,
    });
  }
}

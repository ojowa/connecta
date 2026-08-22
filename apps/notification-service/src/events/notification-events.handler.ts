import { Injectable, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, User } from '@app/common/entities';
import {
  USER_EVENTS,
  MATCH_EVENTS,
  CHAT_EVENTS,
  PAYMENT_EVENTS,
} from '@app/common/constants/events';

@Injectable()
export class NotificationEventsHandler {
  private readonly logger = new Logger('NotificationEventsHandler');

  constructor(
    @InjectRepository(Notification) private notificationRepository: Repository<Notification>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  @EventPattern(USER_EVENTS.USER_CREATED)
  async handleUserCreated(data: { userId: string; email: string; fullName: string }) {
    this.logger.log(`Received user.created for ${data.userId}`);
    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: data.userId,
        type: 'welcome',
        title: 'Welcome to Connecta!',
        body: `Hi ${data.fullName || 'there'}! Complete your profile to start matching.`,
        data: { event: 'user.created' },
        status: 'sent',
        sentAt: new Date(),
      }),
    );
  }

  @EventPattern(USER_EVENTS.EMAIL_VERIFIED)
  async handleEmailVerified(data: { userId: string; email: string }) {
    this.logger.log(`Received email.verified for ${data.userId}`);
    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: data.userId,
        type: 'system',
        title: 'Email Verified',
        body: 'Your email has been verified successfully.',
        data: { event: 'email.verified' },
        status: 'sent',
        sentAt: new Date(),
      }),
    );
  }

  @EventPattern(USER_EVENTS.PASSWORD_CHANGED)
  async handlePasswordChanged(data: { userId: string }) {
    this.logger.log(`Received password.changed for ${data.userId}`);
    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: data.userId,
        type: 'security',
        title: 'Password Changed',
        body: 'Your password was recently changed. If this was not you, please contact support.',
        data: { event: 'password.changed' },
        status: 'sent',
        sentAt: new Date(),
      }),
    );
  }

  @EventPattern(MATCH_EVENTS.MATCH_CREATED)
  async handleMatchCreated(data: {
    matchId: string;
    user1Id: string;
    user2Id: string;
    conversationId: string;
  }) {
    this.logger.log(`Received match.created: ${data.matchId}`);

    const user1 = await this.userRepository.findOne({ where: { id: data.user1Id } });
    const user2 = await this.userRepository.findOne({ where: { id: data.user2Id } });

    if (user1) {
      await this.notificationRepository.save(
        this.notificationRepository.create({
          userId: data.user1Id,
          type: 'new_match',
          title: 'New Match!',
          body: `You matched with ${user2?.fullName || 'someone'}! Send a message to start chatting.`,
          data: { matchId: data.matchId, conversationId: data.conversationId },
          status: 'sent',
          sentAt: new Date(),
        }),
      );
    }

    if (user2) {
      await this.notificationRepository.save(
        this.notificationRepository.create({
          userId: data.user2Id,
          type: 'new_match',
          title: 'New Match!',
          body: `You matched with ${user1?.fullName || 'someone'}! Send a message to start chatting.`,
          data: { matchId: data.matchId, conversationId: data.conversationId },
          status: 'sent',
          sentAt: new Date(),
        }),
      );
    }
  }

  @EventPattern(MATCH_EVENTS.SUPER_LIKE_SENT)
  async handleSuperLikeSent(data: { fromUserId: string; toUserId: string; matchId?: string }) {
    this.logger.log(`Received super_like.sent from ${data.fromUserId} to ${data.toUserId}`);
    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: data.toUserId,
        type: 'super_like',
        title: 'Super Like!',
        body: 'Someone super liked you! Check your discover feed.',
        data: { fromUserId: data.fromUserId, matchId: data.matchId },
        status: 'sent',
        sentAt: new Date(),
      }),
    );
  }

  @EventPattern(MATCH_EVENTS.UNMATCH)
  async handleUnmatch(data: { matchId: string; userId: string }) {
    this.logger.log(`Received unmatch: ${data.matchId}`);
  }

  @EventPattern(CHAT_EVENTS.MESSAGE_SENT)
  async handleMessageSent(data: {
    messageId: string;
    conversationId: string;
    senderId: string;
    content: string;
    participantUserIds: string[];
  }) {
    this.logger.log(`Received message.sent: ${data.messageId}`);

    const sender = await this.userRepository.findOne({ where: { id: data.senderId } });

    for (const recipientId of data.participantUserIds) {
      await this.notificationRepository.save(
        this.notificationRepository.create({
          userId: recipientId,
          type: 'new_message',
          title: sender?.fullName || 'New Message',
          body: data.content?.substring(0, 100) || 'Sent a message',
          data: { messageId: data.messageId, conversationId: data.conversationId },
          status: 'sent',
          sentAt: new Date(),
        }),
      );
    }
  }

  @EventPattern(CHAT_EVENTS.MESSAGE_READ)
  async handleMessageRead(data: {
    userId: string;
    conversationId: string;
    lastReadMessageId: string;
  }) {
    this.logger.log(`Received message.read from ${data.userId} in ${data.conversationId}`);
  }

  @EventPattern(PAYMENT_EVENTS.SUBSCRIPTION_ACTIVATED)
  async handleSubscriptionActivated(data: {
    subscriptionId: string;
    userId: string;
    planId: string;
    planName: string;
  }) {
    this.logger.log(`Received subscription.activated for ${data.userId}`);
    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: data.userId,
        type: 'subscription',
        title: 'Subscription Activated',
        body: `Your ${data.planName} subscription is now active. Enjoy your premium features!`,
        data: { subscriptionId: data.subscriptionId, planId: data.planId },
        status: 'sent',
        sentAt: new Date(),
      }),
    );
  }

  @EventPattern(PAYMENT_EVENTS.PAYMENT_SUCCESSFUL)
  async handlePaymentSuccessful(data: {
    transactionId: string;
    userId: string;
    amount: number;
    currency: string;
  }) {
    this.logger.log(`Received payment.successful for ${data.userId}`);
    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: data.userId,
        type: 'payment',
        title: 'Payment Successful',
        body: `Your payment of ${data.currency} ${data.amount / 100} was successful.`,
        data: { transactionId: data.transactionId },
        status: 'sent',
        sentAt: new Date(),
      }),
    );
  }

  @EventPattern(PAYMENT_EVENTS.SUBSCRIPTION_CANCELLED)
  async handleSubscriptionCancelled(data: {
    subscriptionId: string;
    userId: string;
    planId: string;
  }) {
    this.logger.log(`Received subscription.cancelled for ${data.userId}`);
    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: data.userId,
        type: 'subscription',
        title: 'Subscription Cancelled',
        body: 'Your subscription has been cancelled. You can resubscribe anytime.',
        data: { subscriptionId: data.subscriptionId },
        status: 'sent',
        sentAt: new Date(),
      }),
    );
  }
}

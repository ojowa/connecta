import { Injectable, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@app/common/entities';
import { PAYMENT_EVENTS } from '@app/common/constants/events';

@Injectable()
export class AuthEventsHandler {
  private readonly logger = new Logger('AuthEventsHandler');

  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  @EventPattern(PAYMENT_EVENTS.SUBSCRIPTION_ACTIVATED)
  async handleSubscriptionActivated(data: {
    subscriptionId: string;
    userId: string;
    planId: string;
  }) {
    this.logger.log(
      `Received subscription.activated for ${data.userId} — upgrading role to premium`,
    );
    await this.userRepository.update(data.userId, { role: 'premium' as any });
  }

  @EventPattern(PAYMENT_EVENTS.SUBSCRIPTION_CANCELLED)
  async handleSubscriptionCancelled(data: {
    subscriptionId: string;
    userId: string;
    planId: string;
  }) {
    this.logger.log(
      `Received subscription.cancelled for ${data.userId} — downgrading role to user`,
    );
    await this.userRepository.update(data.userId, { role: 'user' as any });
  }
}

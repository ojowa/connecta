import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Profile, UserPreference, Notification } from '@app/common/entities';
import { UserStatus } from '@app/common/entities/user.entity';
import { USER_EVENTS } from '@app/common/constants/events';

@Injectable()
export class UserEventsHandler {
  private readonly logger = new Logger('UserEventsHandler');

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(UserPreference)
    private preferenceRepository: Repository<UserPreference>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async handleUserCreated(payload: { userId: string; email: string }) {
    this.logger.log(`Handling user.created for ${payload.userId}`);

    await this.userRepository.update(payload.userId, {
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
    });

    this.logger.log(`User ${payload.userId} login tracked`);
  }

  async handleUserUpdated(payload: { userId: string; changes: Partial<User> }) {
    this.logger.log(`Handling user.updated for ${payload.userId}`);

    const profile = await this.profileRepository.findOne({
      where: { userId: payload.userId },
    });

    if (profile) {
      let completion = 0;
      if (profile.firstName) completion += 15;
      if (profile.lastName) completion += 5;
      if (profile.bio) completion += 15;
      if (profile.dateOfBirth) completion += 10;
      if (profile.gender) completion += 5;
      if (profile.photos && profile.photos.length > 0) completion += 20;
      if (profile.jobTitle) completion += 5;
      if (profile.city) completion += 10;
      if (profile.relationshipGoal) completion += 5;
      if (profile.latitude && profile.longitude) completion += 10;

      await this.profileRepository.update(profile.id, { completionPercentage: completion });
    }
  }

  async handleEmailVerified(payload: { userId: string }) {
    this.logger.log(`Handling email.verified for ${payload.userId}`);

    await this.userRepository.update(payload.userId, {
      emailVerified: true,
    });

    const user = await this.userRepository.findOne({ where: { id: payload.userId } });
    if (user && user.status === UserStatus.PENDING_VERIFICATION) {
      await this.userRepository.update(payload.userId, {
        status: UserStatus.ACTIVE,
      });
    }

    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: payload.userId,
        type: 'system',
        title: 'Email Verified',
        body: 'Your email has been verified successfully.',
        status: 'sent',
        sentAt: new Date(),
      }),
    );
  }

  async handlePhoneVerified(payload: { userId: string }) {
    this.logger.log(`Handling phone.verified for ${payload.userId}`);

    await this.userRepository.update(payload.userId, {
      phoneVerified: true,
    });

    const user = await this.userRepository.findOne({ where: { id: payload.userId } });
    if (user && user.status === UserStatus.PENDING_VERIFICATION) {
      await this.userRepository.update(payload.userId, {
        status: UserStatus.ACTIVE,
      });
    }
  }

  async handlePasswordChanged(payload: { userId: string }) {
    this.logger.log(`Handling password.changed for ${payload.userId}`);

    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: payload.userId,
        type: 'system',
        title: 'Password Changed',
        body: 'Your password was recently changed. If you did not make this change, please contact support.',
        status: 'sent',
        sentAt: new Date(),
      }),
    );
  }

  async handleUserDeactivated(payload: { userId: string }) {
    this.logger.log(`Handling user.deactivated for ${payload.userId}`);

    await this.profileRepository.update(
      { userId: payload.userId },
      { isActive: false },
    );

    await this.userRepository.update(payload.userId, {
      status: UserStatus.DEACTIVATED,
      lastActiveAt: new Date(),
    });
  }

  async handleUserBanned(payload: { userId: string; reason: string }) {
    this.logger.log(`Handling user.banned for ${payload.userId}`);

    await this.userRepository.update(payload.userId, {
      status: UserStatus.SUSPENDED,
    });

    await this.profileRepository.update(
      { userId: payload.userId },
      { isActive: false },
    );

    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: payload.userId,
        type: 'system',
        title: 'Account Suspended',
        body: `Your account has been suspended. Reason: ${payload.reason}`,
        status: 'sent',
        sentAt: new Date(),
      }),
    );
  }

  async handleTwoFaEnabled(payload: { userId: string }) {
    this.logger.log(`Handling 2fa.enabled for ${payload.userId}`);

    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: payload.userId,
        type: 'system',
        title: '2FA Enabled',
        body: 'Two-factor authentication has been enabled on your account.',
        status: 'sent',
        sentAt: new Date(),
      }),
    );
  }

  async handleTwoFaDisabled(payload: { userId: string }) {
    this.logger.log(`Handling 2fa.disabled for ${payload.userId}`);

    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: payload.userId,
        type: 'system',
        title: '2FA Disabled',
        body: 'Two-factor authentication has been disabled on your account.',
        status: 'sent',
        sentAt: new Date(),
      }),
    );
  }
}

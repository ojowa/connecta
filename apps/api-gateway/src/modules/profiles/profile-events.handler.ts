import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Profile,
  Photo,
  ProfileInterest,
  Interest,
  User,
  Notification,
} from '@app/common/entities';
import { UserStatus } from '@app/common/entities/user.entity';
import { PROFILE_EVENTS } from '@app/common/constants/events';

@Injectable()
export class ProfileEventsHandler {
  private readonly logger = new Logger('ProfileEventsHandler');

  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
    @InjectRepository(ProfileInterest)
    private profileInterestRepository: Repository<ProfileInterest>,
    @InjectRepository(Interest)
    private interestRepository: Repository<Interest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async handleProfileCreated(payload: { profileId: string; userId: string }) {
    this.logger.log(`Handling profile.created for ${payload.userId}`);

    const profile = await this.profileRepository.findOne({
      where: { id: payload.profileId },
      relations: ['photos'],
    });

    if (profile) {
      let completion = 0;
      if (profile.firstName) completion += 15;
      if (profile.bio) completion += 15;
      if (profile.dateOfBirth) completion += 10;
      if (profile.gender) completion += 5;
      if (profile.photos && profile.photos.length > 0) completion += 20;
      if (profile.city) completion += 10;
      if (profile.relationshipGoal) completion += 5;
      if (profile.latitude && profile.longitude) completion += 10;

      await this.profileRepository.update(profile.id, { completionPercentage: completion });

      if (completion >= 60) {
        await this.userRepository.update(payload.userId, { status: UserStatus.ACTIVE });
      }
    }
  }

  async handleProfileUpdated(payload: {
    profileId: string;
    userId: string;
    changes: Partial<Profile>;
  }) {
    this.logger.log(`Handling profile.updated for ${payload.userId}`);

    const profile = await this.profileRepository.findOne({
      where: { id: payload.profileId },
      relations: ['photos'],
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

  async handlePhotosUpdated(payload: { profileId: string; userId: string }) {
    this.logger.log(`Handling photos.updated for ${payload.userId}`);

    const photoCount = await this.photoRepository.count({
      where: { profileId: payload.profileId },
    });

    const profile = await this.profileRepository.findOne({
      where: { id: payload.profileId },
      relations: ['photos'],
    });

    if (profile) {
      let completion = profile.completionPercentage;
      if (photoCount > 0 && completion < 20) {
        completion += 20;
      } else if (photoCount === 0 && completion >= 20) {
        completion -= 20;
      }
      await this.profileRepository.update(profile.id, { completionPercentage: completion });
    }
  }

  async handleInterestsUpdated(payload: { profileId: string; userId: string }) {
    this.logger.log(`Handling interests.updated for ${payload.userId}`);

    const interestCount = await this.profileInterestRepository.count({
      where: { profileId: payload.profileId },
    });

    this.logger.log(`Profile ${payload.profileId} now has ${interestCount} interests`);
  }

  async handleLocationUpdated(payload: {
    profileId: string;
    userId: string;
    latitude: number;
    longitude: number;
  }) {
    this.logger.log(`Handling location.updated for ${payload.userId}`);

    await this.profileRepository.update(payload.profileId, {
      latitude: payload.latitude,
      longitude: payload.longitude,
    });
  }
}

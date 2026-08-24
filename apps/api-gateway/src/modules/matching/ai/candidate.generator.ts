import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  User,
  Profile,
  UserPreference,
  Like,
  Pass,
  Block,
  Photo,
  ProfileInterest,
  Interest,
} from '@app/common/entities';

export interface CandidateProfile {
  userId: string;
  fullName: string;
  age: number;
  gender: string;
  bio: string;
  jobTitle: string;
  city: string;
  distanceKm: number;
  verified: boolean;
  completionPercentage: number;
  photos: { url: string; isPrimary: boolean }[];
  interests: string[];
  relationshipGoal: string;
}

@Injectable()
export class CandidateGenerator {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(UserPreference) private prefRepo: Repository<UserPreference>,
    @InjectRepository(Like) private likeRepo: Repository<Like>,
    @InjectRepository(Pass) private passRepo: Repository<Pass>,
    @InjectRepository(Block) private blockRepo: Repository<Block>,
    @InjectRepository(Photo) private photoRepo: Repository<Photo>,
    @InjectRepository(ProfileInterest) private profileInterestRepo: Repository<ProfileInterest>,
    @InjectRepository(Interest) private interestRepo: Repository<Interest>,
  ) {}

  async generate(userId: string, limit = 200): Promise<CandidateProfile[]> {
    const prefs = await this.prefRepo.findOne({ where: { userId } });
    if (!prefs) return [];

    const userProfile = await this.profileRepo.findOne({ where: { userId } });
    const userLat = userProfile?.latitude;
    const userLon = userProfile?.longitude;

    // C4: Bounded queries — cap at 10000 to prevent memory issues for active users
    const [likedIds, passedIds, blockedByMeIds, blockedMeIds] = await Promise.all([
      this.likeRepo
        .find({ where: { userId }, select: ['likedUserId'], take: 10000 })
        .then((likes) => likes.map((l) => l.likedUserId)),
      this.passRepo
        .find({ where: { userId }, select: ['passedUserId'], take: 10000 })
        .then((passes) => passes.map((p) => p.passedUserId)),
      this.blockRepo
        .find({ where: { blockerId: userId }, select: ['blockedId'], take: 10000 })
        .then((blocks) => blocks.map((b) => b.blockedId)),
      this.blockRepo
        .find({ where: { blockedId: userId }, select: ['blockerId'], take: 10000 })
        .then((blocks) => blocks.map((b) => b.blockerId)),
    ]);

    const excludeIds = new Set([
      userId,
      ...likedIds,
      ...passedIds,
      ...blockedByMeIds,
      ...blockedMeIds,
    ]);

    const genderFilter = this.resolveGenderFilter(prefs.showMe);

    // C2: Replace innerJoin with subquery since Profile.userId is a plain column, not a relation
    const candidates = await this.profileRepo
      .createQueryBuilder('p')
      .where('p."userId" != :userId', { userId })
      .andWhere('p."isActive" = true')
      .andWhere(`p."userId" IN (SELECT u.id::text FROM users u WHERE u.status = :status)`, {
        status: 'active',
      })
      .andWhere(prefs.showVerifiedOnly ? 'p."verified" = true' : '1=1')
      .andWhere(
        prefs.showProfilesWithPhotosOnly ? 'p.id IN (SELECT ph."profileId" FROM photos ph)' : '1=1',
      )
      .andWhere(genderFilter ? 'p.gender = :gender' : '1=1', { gender: genderFilter })
      .orderBy('p."completionPercentage"', 'DESC')
      .take(limit * 2)
      .getMany();

    const filtered = candidates.filter((c) => !excludeIds.has(c.userId));

    // M2: Fix falsy zero — use != null instead of && (which treats 0 as falsy)
    const withDistance = filtered
      .filter((c) => c.dateOfBirth != null) // M3: Reject candidates without DOB
      .map((c) => ({
        ...c,
        distanceKm:
          userLat != null && userLon != null && c.latitude != null && c.longitude != null
            ? this.haversineDistance(userLat, userLon, c.latitude, c.longitude)
            : 9999,
      }))
      .filter((c) => c.distanceKm <= prefs.maxDistanceKm);

    const ageFiltered = withDistance.filter((c) => {
      const age = this.calculateAge(c.dateOfBirth!);
      return age >= prefs.ageMin && age <= prefs.ageMax;
    });

    const sorted = ageFiltered
      .sort((a, b) => b.completionPercentage - a.completionPercentage)
      .slice(0, limit);

    // H1: Pass distanceKm into enrichCandidate so it's not lost
    return Promise.all(sorted.map((c) => this.enrichCandidate(c)));
  }

  private resolveGenderFilter(showMe: string): string | null {
    switch (showMe) {
      case 'men':
        return 'male';
      case 'women':
        return 'female';
      default:
        return null;
    }
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // H1: Accept distanceKm as parameter instead of discarding it
  private async enrichCandidate(
    profile: Profile & { distanceKm?: number },
  ): Promise<CandidateProfile> {
    const [user, photos, interests] = await Promise.all([
      this.userRepo.findOne({ where: { id: profile.userId } }),
      this.photoRepo.find({ where: { profileId: profile.id }, order: { order: 'ASC' }, take: 5 }),
      this.getInterestNames(profile.id),
    ]);

    const age = profile.dateOfBirth ? this.calculateAge(profile.dateOfBirth) : 0;

    return {
      userId: profile.userId,
      fullName: user?.fullName || '',
      age,
      gender: profile.gender || '',
      bio: profile.bio || '',
      jobTitle: profile.jobTitle || '',
      city: profile.city || '',
      distanceKm: profile.distanceKm ?? 0,
      verified: profile.verified,
      completionPercentage: profile.completionPercentage,
      photos: photos.map((p) => ({ url: p.url, isPrimary: p.isPrimary })),
      interests,
      relationshipGoal: profile.relationshipGoal || '',
    };
  }

  private async getInterestNames(profileId: string): Promise<string[]> {
    const profileInterests = await this.profileInterestRepo.find({
      where: { profileId },
      relations: ['interest'],
    });
    return profileInterests.map((pi) => pi.interest?.name).filter((n): n is string => !!n);
  }
}
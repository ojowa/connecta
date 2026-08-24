import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User, Profile, Like, Pass, Match, DailyLike, Photo, UserPreference, Block, Interest, ProfileInterest } from '@app/common/entities';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(Like) private likeRepo: Repository<Like>,
    @InjectRepository(Pass) private passRepo: Repository<Pass>,
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @InjectRepository(DailyLike) private dailyLikeRepo: Repository<DailyLike>,
    @InjectRepository(Photo) private photoRepo: Repository<Photo>,
    @InjectRepository(UserPreference) private prefRepo: Repository<UserPreference>,
    @InjectRepository(Block) private blockRepo: Repository<Block>,
    @InjectRepository(Interest) private interestRepo: Repository<Interest>,
    @InjectRepository(ProfileInterest) private profileInterestRepo: Repository<ProfileInterest>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getFeed(userId: string, page = 1, limit = 20) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const likedIds = (await this.likeRepo.find({ where: { userId } })).map((l) => l.likedUserId);
    const passedIds = (await this.passRepo.find({ where: { userId } })).map((p) => p.passedUserId);
    const blockedByMe = (await this.blockRepo.find({ where: { blockerId: userId } })).map((b) => b.blockedId);
    const blockedMe = (await this.blockRepo.find({ where: { blockedId: userId } })).map((b) => b.blockerId);
    const excludeIds = [userId, ...likedIds, ...passedIds, ...blockedByMe, ...blockedMe];

    const pref = await this.prefRepo.findOne({ where: { userId } });
    const ageMin = pref?.ageMin ?? 18;
    const ageMax = pref?.ageMax ?? 50;
    const now = new Date();
    const maxDobStr = `${now.getFullYear() - ageMin}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const minDobStr = `${now.getFullYear() - ageMax - 1}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let qb = this.userRepo
      .createQueryBuilder('u')
      .where('u.id NOT IN (:...excludeIds)', { excludeIds })
      .andWhere('u.status = :status', { status: 'active' })
      .andWhere('u.dateOfBirth <= :maxDob', { maxDob: maxDobStr })
      .andWhere('u.dateOfBirth >= :minDob', { minDob: minDobStr });

    if (pref?.showMe && pref.showMe !== 'everyone') {
      qb = qb.andWhere('u.gender = :gender', { gender: pref.showMe });
    }

    const users = await qb.skip((page - 1) * limit).take(limit).getMany();

    const userIds = users.map((u) => u.id);
    const profiles = userIds.length > 0 ? await this.profileRepo.find({ where: { userId: In(userIds) } }) : [];
    const profileIds = profiles.map((p) => p.id);
    const photos = profileIds.length > 0 ? await this.photoRepo.find({ where: { profileId: In(profileIds) }, order: { order: 'ASC' } }) : [];
    const profileInterests = profileIds.length > 0 ? await this.profileInterestRepo.find({ where: { profileId: In(profileIds) } }) : [];
    const interestIds = [...new Set(profileInterests.map((pi) => pi.interestId))];
    const interests = interestIds.length > 0 ? await this.interestRepo.find({ where: { id: In(interestIds) } }) : [];

    const profileMap = new Map(profiles.map((p) => [p.userId, p]));
    const photoMap = new Map<string, Photo[]>();
    for (const photo of photos) {
      const list = photoMap.get(photo.profileId) || [];
      list.push(photo);
      photoMap.set(photo.profileId, list);
    }
    const interestMap = new Map<string, { id: string; name: string; category?: string }[]>();
    for (const pi of profileInterests) {
      const interest = interests.find((i) => i.id === pi.interestId);
      if (interest) {
        const list = interestMap.get(pi.profileId) || [];
        list.push({ id: interest.id, name: interest.name, category: interest.category });
        interestMap.set(pi.profileId, list);
      }
    }

    return {
      candidates: users.map((u) => {
        const profile = profileMap.get(u.id);
        const profilePhotos = profile ? (photoMap.get(profile.id) || []) : [];
        const profileInterests = profile ? (interestMap.get(profile.id) || []) : [];
        return {
          user: { id: u.id, fullName: u.fullName, dateOfBirth: u.dateOfBirth, gender: u.gender },
          profile: profile ? {
            ...profile,
            photos: profilePhotos,
            interests: profileInterests,
          } : null,
        };
      }),
      meta: { page, limit, hasMore: users.length === limit },
    };
  }

  async like(likerId: string, likedId: string) {
    if (likerId === likedId) throw new BadRequestException('Cannot like yourself');

    const today = new Date().toISOString().split('T')[0];
    let dailyLike = await this.dailyLikeRepo.findOne({ where: { userId: likerId, date: today as any } });
    if (!dailyLike) {
      dailyLike = this.dailyLikeRepo.create({ userId: likerId, date: today as any, likesGiven: 0, superLikesGiven: 0 });
      await this.dailyLikeRepo.save(dailyLike);
    }
    if (dailyLike.likesGiven >= 50) throw new BadRequestException('Daily like limit reached. Try again tomorrow.');

    const existing = await this.likeRepo.findOne({ where: { userId: likerId, likedUserId: likedId } });
    if (existing) return existing;
    const like = this.likeRepo.create({ userId: likerId, likedUserId: likedId });
    await this.likeRepo.save(like);
    await this.dailyLikeRepo.increment({ id: dailyLike.id }, 'likesGiven', 1);

    const mutual = await this.likeRepo.findOne({ where: { userId: likedId, likedUserId: likerId } });
    if (mutual) {
      const match = this.matchRepo.create({ user1Id: likerId, user2Id: likedId, matchedAt: new Date(), isActive: true });
      await this.matchRepo.save(match);
      this.eventEmitter.emit('match.created', { matchId: match.id, user1Id: likerId, user2Id: likedId });
      return { liked: true, matched: true, matchId: match.id };
    }
    this.eventEmitter.emit('user.liked', { likerId, likedId });
    return { liked: true, matched: false };
  }

  async pass(passerId: string, passedId: string) {
    const existing = await this.passRepo.findOne({ where: { userId: passerId, passedUserId: passedId } });
    if (existing) return existing;
    const pass = this.passRepo.create({ userId: passerId, passedUserId: passedId });
    await this.passRepo.save(pass);
    return { passed: true };
  }

  async superlike(likerId: string, likedId: string) {
    if (likerId === likedId) throw new BadRequestException('Cannot super like yourself');

    const today = new Date().toISOString().split('T')[0];
    let dailyLike = await this.dailyLikeRepo.findOne({ where: { userId: likerId, date: today as any } });
    if (!dailyLike) {
      dailyLike = this.dailyLikeRepo.create({ userId: likerId, date: today as any, likesGiven: 0, superLikesGiven: 0 });
      await this.dailyLikeRepo.save(dailyLike);
    }
    if (dailyLike.superLikesGiven >= 3) throw new BadRequestException('Daily super like limit reached (3/day).');

    const like = this.likeRepo.create({ userId: likerId, likedUserId: likedId, isSuperLike: true });
    await this.likeRepo.save(like);
    await this.dailyLikeRepo.increment({ id: dailyLike.id }, 'superLikesGiven', 1);
    this.eventEmitter.emit('user.super_liked', { likerId, likedId });
    return { superLiked: true };
  }

  async undo(userId: string) {
    const lastLike = await this.likeRepo.findOne({ where: { userId }, order: { createdAt: 'DESC' } });
    const lastPass = await this.passRepo.findOne({ where: { userId }, order: { createdAt: 'DESC' } });

    if (!lastLike && !lastPass) throw new NotFoundException('No action to undo');

    if (lastLike && (!lastPass || lastLike.createdAt > lastPass.createdAt)) {
      await this.likeRepo.remove(lastLike);
      if (lastLike.isSuperLike) {
        await this.dailyLikeRepo.decrement({ userId, date: lastLike.createdAt.toISOString().split('T')[0] } as any, 'superLikesGiven', 1);
      } else {
        await this.dailyLikeRepo.decrement({ userId, date: lastLike.createdAt.toISOString().split('T')[0] } as any, 'likesGiven', 1);
      }
      return { undone: true, action: 'like' };
    }

    if (lastPass) {
      await this.passRepo.remove(lastPass);
      return { undone: true, action: 'pass' };
    }

    throw new NotFoundException('No action to undo');
  }

  async getMatches(userId: string, page = 1, limit = 20) {
    const [matches, total] = await this.matchRepo.findAndCount({
      where: [{ user1Id: userId, isActive: true }, { user2Id: userId, isActive: true }],
      order: { matchedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { matches, meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async unmatch(userId: string, matchId: string) {
    const match = await this.matchRepo.findOne({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Match not found');
    if (match.user1Id !== userId && match.user2Id !== userId) throw new BadRequestException('Not your match');
    await this.matchRepo.update(matchId, { isActive: false });
    return { unmatched: true };
  }

  async getLikedYou(userId: string, page = 1, limit = 20) {
    const [likes, total] = await this.likeRepo.findAndCount({
      where: { likedUserId: userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { likes, meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async getCompatibility(userId: string, targetUserId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const target = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!user || !target) throw new NotFoundException('User not found');

    const userProfile = await this.profileRepo.findOne({ where: { userId } });
    const targetProfile = await this.profileRepo.findOne({ where: { userId: targetUserId } });

    let score = 50;
    const factors: Record<string, boolean> = {};

    if (userProfile && targetProfile) {
      const userPIs = await this.profileInterestRepo.find({ where: { profileId: userProfile.id } });
      const targetPIs = await this.profileInterestRepo.find({ where: { profileId: targetProfile.id } });
      const userIds = new Set(userPIs.map((p) => p.interestId));
      const overlap = targetPIs.filter((p) => userIds.has(p.interestId)).length;
      const total = new Set([...userPIs.map((p) => p.interestId), ...targetPIs.map((p) => p.interestId)]).size;
      const interestScore = total > 0 ? Math.round((overlap / total) * 100) : 0;
      score = interestScore;
      factors.interests = interestScore > 60;
    }

    if (user.dateOfBirth && target.dateOfBirth) {
      const ageDiff = Math.abs(new Date(user.dateOfBirth).getFullYear() - new Date(target.dateOfBirth).getFullYear());
      const ageScore = Math.max(0, 100 - ageDiff * 5);
      score = Math.round((score + ageScore) / 2);
      factors.age = ageDiff <= 5;
    }

    if (userProfile?.city && targetProfile?.city) {
      factors.location = userProfile.city === targetProfile.city;
      if (factors.location) score = Math.min(100, score + 10);
    }

    return { compatibility: score, factors };
  }

  async getSync(userId: string, since: number) {
    return { likes: [], passes: [], matches: [] };
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User, Profile, Like, Pass, Match, DailyLike, Photo, UserPreference, Block, Interest, ProfileInterest, Boost, PhotoLike, Moment, MomentView } from '@app/common/entities';
import { MatchmakingEngine } from './ai/matchmaking.engine';
import { CompatibilityEngine } from './ai/compatibility.engine';
import { ScamDetector } from './ai/scam.detector';
import { IcebreakerGenerator } from './ai/icebreaker.generator';
import { CandidateGenerator } from './ai/candidate.generator';

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
    @InjectRepository(Boost) private boostRepo: Repository<Boost>,
    @InjectRepository(PhotoLike) private photoLikeRepo: Repository<PhotoLike>,
    @InjectRepository(Moment) private momentRepo: Repository<Moment>,
    @InjectRepository(MomentView) private momentViewRepo: Repository<MomentView>,
    private readonly eventEmitter: EventEmitter2,
    private readonly matchmakingEngine: MatchmakingEngine,
    private readonly compatibilityEngine: CompatibilityEngine,
    private readonly scamDetector: ScamDetector,
    private readonly icebreakerGenerator: IcebreakerGenerator,
    private readonly candidateGenerator: CandidateGenerator,
  ) {}

  private validateUserId(userId: string) {
    if (!userId || userId === '' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      throw new BadRequestException('Valid user ID is required');
    }
  }

  async getFeed(userId: string, page = 1, limit = 20) {
    this.validateUserId(userId);
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
      .andWhere('u.dateOfBirth >= :minDob', { minDob: minDobStr })
      .andWhere('u.incognitoMode = :incognito', { incognito: false });

    if (pref?.showMe && pref.showMe !== 'everyone') {
      qb = qb.andWhere('u.gender = :gender', { gender: pref.showMe });
    }

    if (pref?.passportEnabled && pref.passportLatitude != null && pref.passportLongitude != null) {
      qb = qb.orderBy(
        `ST_Distance(
          ST_SetSRID(ST_MakePoint(u.longitude, u.latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(:passportLng, :passportLat), 4326)::geography
        )`,
        'ASC',
      );
      qb.setParameters({ passportLng: pref.passportLongitude, passportLat: pref.passportLatitude });
    }

    const activeBoost = await this.boostRepo.findOne({
      where: { userId, isActive: true, expiresAt: MoreThan(new Date()) },
    });

    const users = await qb.skip((page - 1) * limit).take(limit).getMany();

    const userIds = users.map((u) => u.id);
    const boostedUserIds = activeBoost
      ? (await this.boostRepo.find({ where: { isActive: true, expiresAt: MoreThan(new Date()) }, select: ['userId'] })).map((b) => b.userId)
      : [];

    const sortedUserIds = [...userIds].sort((a, b) => {
      const aBoosted = boostedUserIds.includes(a) ? 1 : 0;
      const bBoosted = boostedUserIds.includes(b) ? 1 : 0;
      return bBoosted - aBoosted;
    });

    const profiles = sortedUserIds.length > 0 ? await this.profileRepo.find({ where: { userId: In(sortedUserIds) } }) : [];
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

    const candidates = sortedUserIds.map((uid) => {
      const u = users.find((usr) => usr.id === uid)!;
      const profile = profileMap.get(u.id);
      const profilePhotos = profile ? (photoMap.get(profile.id) || []) : [];
      const profileInterestsList = profile ? (interestMap.get(profile.id) || []) : [];
      return {
        user: { id: u.id, fullName: u.fullName, dateOfBirth: u.dateOfBirth, gender: u.gender },
        profile: profile ? {
          ...profile,
          photos: profilePhotos,
          interests: profileInterestsList,
        } : null,
      };
    });

    const enriched = await Promise.all(
      candidates.map(async (c) => {
        try {
          const compatibility = await this.compatibilityEngine.score(userId, c.user.id);
          return { ...c, compatibility };
        } catch {
          return c;
        }
      }),
    );

    enriched.sort((a, b) => {
      const aBoosted = boostedUserIds.includes(a.user.id) ? 1 : 0;
      const bBoosted = boostedUserIds.includes(b.user.id) ? 1 : 0;
      if (aBoosted !== bBoosted) return bBoosted - aBoosted;
      const aScore = (a as any).compatibility?.overallScore ?? 0;
      const bScore = (b as any).compatibility?.overallScore ?? 0;
      return bScore - aScore;
    });

    return {
      candidates: enriched,
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

  async rewind(userId: string) {
    const lastLikes = await this.likeRepo.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 5 });
    const lastPasses = await this.passRepo.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 5 });

    if (lastLikes.length === 0 && lastPasses.length === 0) throw new NotFoundException('No actions to rewind');

    const allActions = [
      ...lastLikes.map((l) => ({ type: 'like' as const, date: l.createdAt, isSuperLike: l.isSuperLike })),
      ...lastPasses.map((p) => ({ type: 'pass' as const, date: p.createdAt })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    const actionsToUndo = allActions.slice(0, 5);
    let likesRemoved = 0;
    let passesRemoved = 0;

    for (const action of actionsToUndo) {
      if (action.type === 'like') {
        const like = lastLikes.find((l) => l.createdAt.getTime() === action.date.getTime());
        if (like) {
          await this.likeRepo.remove(like);
          const dateStr = like.createdAt.toISOString().split('T')[0];
          if (like.isSuperLike) {
            await this.dailyLikeRepo.decrement({ userId, date: dateStr } as any, 'superLikesGiven', 1);
          } else {
            await this.dailyLikeRepo.decrement({ userId, date: dateStr } as any, 'likesGiven', 1);
          }
          likesRemoved++;
        }
      } else {
        const pass = lastPasses.find((p) => p.createdAt.getTime() === action.date.getTime());
        if (pass) {
          await this.passRepo.remove(pass);
          passesRemoved++;
        }
      }
    }

    return { rewound: true, likesRemoved, passesRemoved, total: likesRemoved + passesRemoved };
  }

  async activateBoost(userId: string) {
    const existingActive = await this.boostRepo.findOne({
      where: { userId, isActive: true, expiresAt: MoreThan(new Date()) },
    });
    if (existingActive) throw new BadRequestException('Boost is already active');

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const boost = this.boostRepo.create({
      userId,
      durationMinutes: 30,
      expiresAt,
      isActive: true,
    });
    await this.boostRepo.save(boost);

    this.eventEmitter.emit('boost.activated', { userId, boostId: boost.id });
    return { activated: true, expiresAt, boostId: boost.id };
  }

  async getBoostStatus(userId: string) {
    const activeBoost = await this.boostRepo.findOne({
      where: { userId, isActive: true, expiresAt: MoreThan(new Date()) },
    });

    const totalBoosts = await this.boostRepo.count({ where: { userId } });

    return {
      activeBoost: activeBoost ? {
        id: activeBoost.id,
        expiresAt: activeBoost.expiresAt,
        viewsGained: activeBoost.viewsGained,
        likesGained: activeBoost.likesGained,
      } : null,
      totalBoosts,
    };
  }

  async toggleIncognito(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.incognitoMode = !user.incognitoMode;
    await this.userRepo.save(user);

    return { incognitoMode: user.incognitoMode };
  }

  async updatePassport(userId: string, latitude: number, longitude: number, enabled: boolean) {
    let pref = await this.prefRepo.findOne({ where: { userId } });
    if (!pref) {
      pref = this.prefRepo.create({ userId });
    }

    pref.passportLatitude = latitude;
    pref.passportLongitude = longitude;
    pref.passportEnabled = enabled;
    await this.prefRepo.save(pref);

    return {
      passportEnabled: pref.passportEnabled,
      passportLatitude: pref.passportLatitude,
      passportLongitude: pref.passportLongitude,
    };
  }

  async likePhoto(userId: string, photoId: string, profileId: string) {
    const existing = await this.photoLikeRepo.findOne({ where: { userId, photoId } });
    if (existing) throw new BadRequestException('Already liked this photo');

    const photoLike = this.photoLikeRepo.create({ userId, photoId, profileId });
    await this.photoLikeRepo.save(photoLike);

    return { liked: true, photoId };
  }

  async getPhotoStats(userId: string) {
    const photoLikes = await this.photoLikeRepo.find({ where: { userId } });

    const photoCounts = new Map<string, number>();
    for (const pl of photoLikes) {
      photoCounts.set(pl.photoId, (photoCounts.get(pl.photoId) || 0) + 1);
    }

    const totalLikes = photoLikes.length;

    return {
      totalLikes,
      photos: Array.from(photoCounts.entries()).map(([photoId, count]) => ({ photoId, count })),
    };
  }

  async getMatches(userId: string, page = 1, limit = 20) {
    const [matches, total] = await this.matchRepo.findAndCount({
      where: [{ user1Id: userId, isActive: true }, { user2Id: userId, isActive: true }],
      order: { matchedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const otherUserIds = matches.map((m) => m.user1Id === userId ? m.user2Id : m.user1Id);
    const otherUsers = otherUserIds.length > 0 ? await this.userRepo.find({ where: { id: In(otherUserIds) } }) : [];
    const userMap = new Map(otherUsers.map((u) => [u.id, u]));

    const otherProfiles = otherUserIds.length > 0 ? await this.profileRepo.find({ where: { userId: In(otherUserIds) } }) : [];
    const profileMap = new Map(otherProfiles.map((p) => [p.userId, p]));
    const profileIds = otherProfiles.map((p) => p.id);
    const photos = profileIds.length > 0 ? await this.photoRepo.find({ where: { profileId: In(profileIds) }, order: { order: 'ASC' } }) : [];
    const photoMap = new Map<string, Photo[]>();
    for (const photo of photos) {
      const list = photoMap.get(photo.profileId) || [];
      list.push(photo);
      photoMap.set(photo.profileId, list);
    }

    return {
      matches: matches.map((m) => {
        const otherId = m.user1Id === userId ? m.user2Id : m.user1Id;
        const otherUser = userMap.get(otherId);
        const profile = profileMap.get(otherId);
        const profilePhotos = profile ? (photoMap.get(profile.id) || []) : [];
        return {
          ...m,
          otherUser: otherUser ? {
            id: otherUser.id,
            fullName: otherUser.fullName,
            photos: profilePhotos.map((p) => ({ id: p.id, url: p.url, isPrimary: p.isPrimary, order: p.order })),
          } : null,
        };
      }),
      meta: { page, limit, total, hasMore: total > page * limit },
    };
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

    const likerIds = likes.map((l) => l.userId);
    const likers = likerIds.length > 0 ? await this.userRepo.find({ where: { id: In(likerIds) } }) : [];
    const userMap = new Map(likers.map((u) => [u.id, u]));
    const profiles = likerIds.length > 0 ? await this.profileRepo.find({ where: { userId: In(likerIds) } }) : [];
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));
    const profileIds = profiles.map((p) => p.id);
    const photos = profileIds.length > 0 ? await this.photoRepo.find({ where: { profileId: In(profileIds) }, order: { order: 'ASC' } }) : [];
    const photoMap = new Map<string, Photo[]>();
    for (const photo of photos) {
      const list = photoMap.get(photo.profileId) || [];
      list.push(photo);
      photoMap.set(photo.profileId, list);
    }

    return {
      likes: likes.map((l) => {
        const user = userMap.get(l.userId);
        const profile = profileMap.get(l.userId);
        const profilePhotos = profile ? (photoMap.get(profile.id) || []) : [];
        return {
          ...l,
          user: user ? {
            id: user.id,
            fullName: user.fullName,
            photos: profilePhotos.map((p) => ({ id: p.id, url: p.url, isPrimary: p.isPrimary, order: p.order })),
          } : null,
        };
      }),
      meta: { page, limit, total, hasMore: total > page * limit },
    };
  }

  async getCompatibility(userId: string, targetUserId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const target = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!user || !target) throw new NotFoundException('User not found');

    const result = await this.compatibilityEngine.score(userId, targetUserId);

    const icebreakers = await this.icebreakerGenerator.generate(
      await this.profileRepo.findOne({ where: { userId } }),
      {
        userId: target.id,
        fullName: target.fullName,
        age: target.dateOfBirth ? this.calculateAge(target.dateOfBirth) : 0,
        gender: target.gender || '',
        bio: '',
        jobTitle: '',
        city: '',
        distanceKm: 0,
        verified: false,
        completionPercentage: 0,
        photos: [],
        interests: [],
        relationshipGoal: '',
      },
      result,
    );

    return { compatibility: result.overallScore, breakdown: result.breakdown, sharedInterests: result.sharedInterests, insights: result.insights, icebreakers };
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

  async getSync(userId: string, since: number) {
    return { likes: [], passes: [], matches: [] };
  }

  async createMoment(userId: string, mediaUrl: string, caption?: string, mediaType?: string) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const moment = this.momentRepo.create({ userId, mediaUrl, caption, mediaType, expiresAt });
    return this.momentRepo.save(moment);
  }

  async getMoments(userId: string) {
    const matches = await this.matchRepo.find({
      where: [{ user1Id: userId, isActive: true }, { user2Id: userId, isActive: true }],
    });
    const matchUserIds = matches.map((m) => (m.user1Id === userId ? m.user2Id : m.user1Id));
    if (matchUserIds.length === 0) return [];

    const moments = await this.momentRepo.find({
      where: { userId: In(matchUserIds), expiresAt: MoreThan(new Date()) },
      order: { createdAt: 'DESC' },
    });

    const momentIds = moments.map((m) => m.id);

    const views =
      momentIds.length > 0
        ? await this.momentViewRepo.find({ where: { momentId: In(momentIds), viewerId: userId } })
        : [];
    const viewedSet = new Set(views.map((v) => v.momentId));

    const userIds = [...new Set(moments.map((m) => m.userId))];
    const users = userIds.length > 0 ? await this.userRepo.find({ where: { id: In(userIds) } }) : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    return moments.map((m) => ({
      ...m,
      viewed: viewedSet.has(m.id),
      user: userMap.get(m.userId) || null,
    }));
  }

  async viewMoment(userId: string, momentId: string) {
    const moment = await this.momentRepo.findOne({ where: { id: momentId } });
    if (!moment) throw new NotFoundException('Moment not found');
    if (new Date(moment.expiresAt) <= new Date()) throw new BadRequestException('Moment has expired');

    const existing = await this.momentViewRepo.findOne({ where: { momentId, viewerId: userId } });
    if (!existing) {
      const view = this.momentViewRepo.create({ momentId, viewerId: userId });
      await this.momentViewRepo.save(view);
      await this.momentRepo.increment({ id: momentId }, 'viewCount', 1);
    }
    return { viewed: true };
  }

  async deleteMoment(userId: string, momentId: string) {
    const moment = await this.momentRepo.findOne({ where: { id: momentId } });
    if (!moment) throw new NotFoundException('Moment not found');
    if (moment.userId !== userId) throw new BadRequestException('Not your moment');
    await this.momentRepo.remove(moment);
    return { deleted: true };
  }

  async getMyMoments(userId: string) {
    const moments = await this.momentRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    return moments.map((m) => ({
      ...m,
      expired: new Date(m.expiresAt) <= new Date(),
    }));
  }

  async checkScamRisk(userId: string, targetUserId: string) {
    return this.scamDetector.analyzeConversation(userId, targetUserId);
  }

  async getIcebreakers(userId: string, targetUserId: string) {
    const userProfile = await this.profileRepo.findOne({ where: { userId } });
    const targetProfile = await this.profileRepo.findOne({ where: { userId: targetUserId } });
    const targetUser = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!targetProfile || !targetUser) throw new NotFoundException('Target user not found');

    const targetInterests = await this.profileInterestRepo.find({ where: { profileId: targetProfile.id }, relations: ['interest'] });
    const interestNames = targetInterests.map((pi) => pi.interest?.name).filter((n): n is string => !!n);

    const candidateProfile = {
      userId: targetUserId,
      fullName: targetUser.fullName,
      age: targetUser.dateOfBirth ? this.calculateAge(targetUser.dateOfBirth) : 0,
      gender: targetProfile.gender || '',
      bio: targetProfile.bio || '',
      jobTitle: targetProfile.jobTitle || '',
      city: targetProfile.city || '',
      distanceKm: 0,
      verified: targetProfile.verified,
      completionPercentage: targetProfile.completionPercentage,
      photos: [],
      interests: interestNames,
      relationshipGoal: targetProfile.relationshipGoal || '',
    };

    const compatibility = await this.compatibilityEngine.score(userId, targetUserId);
    return this.icebreakerGenerator.generate(userProfile, candidateProfile, compatibility);
  }

  async getBehavioralAnalysis(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const profile = await this.profileRepo.findOne({ where: { userId } });

    let riskScore = 0;
    const flags: string[] = [];

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [messages24h, likesGiven24h, totalReports, photoCount] = await Promise.all([
      this.likeRepo.count({ where: { userId, createdAt: MoreThan(oneDayAgo) } }),
      this.likeRepo.count({ where: { userId, createdAt: MoreThan(oneDayAgo) } }),
      0,
      profile ? 0 : 0,
    ]);

    if (messages24h > 200) { flags.push('mass_messaging'); riskScore += 0.4; }
    if (likesGiven24h > 100) { flags.push('like_spam'); riskScore += 0.3; }
    if (photoCount === 0) { flags.push('no_photos'); riskScore += 0.2; }
    if (profile && !profile.bio) { flags.push('no_bio'); riskScore += 0.1; }

    const finalRisk = Math.min(riskScore, 1);
    return {
      riskScore: Number(finalRisk.toFixed(2)),
      flags,
      isSuspicious: finalRisk > 0.5,
      safetyScore: Math.round((1 - finalRisk) * 100),
    };
  }
}

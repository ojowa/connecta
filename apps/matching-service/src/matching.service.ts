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

    const users = await this.userRepo
      .createQueryBuilder('u')
      .where('u.id NOT IN (:...excludeIds)', { excludeIds })
      .andWhere('u.status = :status', { status: 'active' })
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const userIds = users.map((u) => u.id);
    const profiles = await this.profileRepo.find({ where: { userId: In(userIds) } });
    const profileIds = profiles.map((p) => p.id);
    const photos = profileIds.length > 0 ? await this.photoRepo.find({ where: { profileId: In(profileIds) }, order: { order: 'ASC' } }) : [];

    const profileMap = new Map(profiles.map((p) => [p.userId, p]));
    const photoMap = new Map<string, Photo[]>();
    for (const photo of photos) {
      const list = photoMap.get(photo.profileId) || [];
      list.push(photo);
      photoMap.set(photo.profileId, list);
    }

    return {
      candidates: users.map((u) => {
        const profile = profileMap.get(u.id);
        return {
          id: u.id,
          fullName: u.fullName,
          dateOfBirth: u.dateOfBirth,
          gender: u.gender,
          profile: profile || null,
          photos: profile ? (photoMap.get(profile.id) || []) : [],
        };
      }),
      meta: { page, limit, hasMore: users.length === limit },
    };
  }

  async like(likerId: string, likedId: string) {
    if (likerId === likedId) throw new BadRequestException('Cannot like yourself');
    const existing = await this.likeRepo.findOne({ where: { userId: likerId, likedUserId: likedId } });
    if (existing) return existing;
    const like = this.likeRepo.create({ userId: likerId, likedUserId: likedId });
    await this.likeRepo.save(like);
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
    const like = this.likeRepo.create({ userId: likerId, likedUserId: likedId, isSuperLike: true });
    await this.likeRepo.save(like);
    this.eventEmitter.emit('user.super_liked', { likerId, likedId });
    return { superLiked: true };
  }

  async undo(userId: string) {
    const lastLike = await this.likeRepo.findOne({ where: { userId }, order: { createdAt: 'DESC' } });
    if (!lastLike) throw new NotFoundException('No action to undo');
    await this.likeRepo.remove(lastLike);
    return { undone: true, action: 'like' };
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
    const score = Math.floor(Math.random() * 40) + 60;
    return { compatibility: score, factors: { interests: score > 70, lifestyle: score > 60, goals: score > 50 } };
  }

  async getSync(userId: string, since: number) {
    return { likes: [], passes: [], matches: [] };
  }
}

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { User, Profile, Like, Pass, Match, DailyLike, Photo, Conversation, ConversationParticipant, UserPreference } from '@app/common/entities';
import { MatchmakingEngine } from './ai/matchmaking.engine';

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
    @InjectRepository(Conversation) private convRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant) private partRepo: Repository<ConversationParticipant>,
    @InjectRepository(UserPreference) private prefRepo: Repository<UserPreference>,
    private matchmakingEngine: MatchmakingEngine,
  ) {}

  async getFeed(userId: string, page = 1, limit = 20) {
    const feed = await this.matchmakingEngine.generateFeed(userId, page, limit);
    return { profiles: feed, meta: { page, limit, total: feed.length, hasMore: feed.length === limit } };
  }

  async like(userId: string, targetUserId: string, likeType = 'normal') {
    if (userId === targetUserId) throw new BadRequestException('Cannot like yourself');
    const existing = await this.likeRepo.findOne({ where: { userId, likedUserId: targetUserId } });
    if (existing) throw new BadRequestException('Already liked this user');
    const target = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!target) throw new NotFoundException('User not found');
    const like = this.likeRepo.create({ userId, likedUserId: targetUserId, isSuperLike: likeType === 'super' });
    await this.likeRepo.save(like);
    // H4: Atomic increment to prevent race condition
    await this.dailyLikeRepo
      .createQueryBuilder()
      .insert()
      .into(DailyLike)
      .values({ userId, date: new Date(), likesGiven: 1 })
      .orUpdate(['likesGiven'], ['userId', 'date'])
      .execute();
    // Also increment atomically
    await this.dailyLikeRepo
      .createQueryBuilder()
      .update(DailyLike)
      .set({ likesGiven: () => 'likesGiven + 1' })
      .where('userId = :userId AND date = CURRENT_DATE', { userId })
      .execute();
    const daily = await this.dailyLikeRepo.findOne({ where: { userId, date: new Date() } });
    const mutualLike = await this.likeRepo.findOne({ where: { userId: targetUserId, likedUserId: userId } });
    if (mutualLike) {
      const conv = await this.convRepo.save(this.convRepo.create({ type: 'direct' }));
      const match = await this.matchRepo.save(this.matchRepo.create({ userAId: userId, userBId: targetUserId, conversationId: conv.id, matchedVia: likeType === 'super' ? 'super_like' : 'like' }));
      await this.partRepo.save([
        this.partRepo.create({ conversationId: conv.id, userId }),
        this.partRepo.create({ conversationId: conv.id, userId: targetUserId }),
      ]);
      return { likedUserId: targetUserId, likeType, isMutual: true, match: { matchId: match.id, matchedAt: match.matchedAt, conversationId: conv.id } };
    }
    return { likedUserId: targetUserId, likeType, isMutual: false, remainingLikes: Math.max(0, 50 - (daily ? daily.likesGiven + 1 : 1)) };
  }

  async pass(userId: string, targetUserId: string) {
    const existing = await this.passRepo.findOne({ where: { userId, passedUserId: targetUserId } });
    if (!existing) { await this.passRepo.save(this.passRepo.create({ userId, passedUserId: targetUserId })); }
    return { passedUserId: targetUserId, passedAt: new Date() };
  }

  async superLike(userId: string, targetUserId: string) {
    return this.like(userId, targetUserId, 'super');
  }

  async undo(userId: string) {
    const lastLike = await this.likeRepo.findOne({ where: { userId }, order: { createdAt: 'DESC' } });
    if (!lastLike) throw new BadRequestException('Nothing to undo');

    // H3: Check if this like created a mutual match — if so, clean it up
    const mutualLike = await this.likeRepo.findOne({
      where: { userId: lastLike.likedUserId, likedUserId: userId },
    });
    if (mutualLike) {
      const match = await this.matchRepo.findOne({
        where: [
          { userAId: userId, userBId: lastLike.likedUserId },
          { userAId: lastLike.likedUserId, userBId: userId },
        ],
      });
      if (match) {
        await this.partRepo.delete({ conversationId: match.conversationId });
        await this.convRepo.delete({ id: match.conversationId });
        await this.matchRepo.remove(match);
      }
    }

    await this.likeRepo.remove(lastLike);
    return { undone: true, previousAction: lastLike.isSuperLike ? 'super_like' : 'like', remainingUndos: 2 };
  }

  async getMatches(userId: string, page = 1, limit = 20) {
    const [matches, total] = await this.matchRepo.findAndCount({
      where: [{ userAId: userId, isActive: true }, { userBId: userId, isActive: true }],
      order: { matchedAt: 'DESC' }, skip: (page - 1) * limit, take: limit,
    });
    const enriched = await Promise.all(matches.map(async (m) => {
      const otherUserId = m.userAId === userId ? m.userBId : m.userAId;
      const user = await this.userRepo.findOne({ where: { id: otherUserId } });
      const profile = await this.profileRepo.findOne({ where: { userId: otherUserId } });
      return { matchId: m.id, matchedUser: { userId: otherUserId, fullName: user?.fullName, profile }, matchedAt: m.matchedAt, conversationId: m.conversationId };
    }));
    return { matches: enriched, meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async unmatch(userId: string, matchId: string) {
    const match = await this.matchRepo.findOne({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Match not found');
    if (match.userAId !== userId && match.userBId !== userId) throw new BadRequestException('Not your match');
    await this.matchRepo.update(matchId, { isActive: false });
    return { unmatched: true, matchId };
  }

  async getLikedYou(userId: string, page = 1, limit = 20) {
    const [likes, total] = await this.likeRepo.findAndCount({
      where: { likedUserId: userId }, order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit,
    });
    const enriched = await Promise.all(likes.map(async (l) => {
      const user = await this.userRepo.findOne({ where: { id: l.userId } });
      return { likeId: l.id, fromUser: { userId: l.userId, fullName: user?.fullName }, likeType: l.isSuperLike ? 'super' : 'normal', likedAt: l.createdAt };
    }));
    return { likes: enriched, totalLikes: total, meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async getCompatibility(userId: string, targetUserId: string) {
    return this.matchmakingEngine.getCompatibilityScore(userId, targetUserId);
  }

  async checkScamRisk(userId: string, targetUserId: string) {
    return this.matchmakingEngine.checkScamRisk(userId, targetUserId);
  }

  async getBehavioralAnalysis(userId: string) {
    return this.matchmakingEngine.getBehavioralAnalysis(userId);
  }
}

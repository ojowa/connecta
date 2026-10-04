import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBehavior, EloScore, PhotoAnalytic, ConversationSignal, Photo, Match } from '@app/common/entities';

@Injectable()
export class MatchingEnhancementService {
  constructor(
    @InjectRepository(UserBehavior) private behaviorRepo: Repository<UserBehavior>,
    @InjectRepository(EloScore) private eloRepo: Repository<EloScore>,
    @InjectRepository(PhotoAnalytic) private photoAnalyticsRepo: Repository<PhotoAnalytic>,
    @InjectRepository(ConversationSignal) private convSignalRepo: Repository<ConversationSignal>,
    @InjectRepository(Photo) private photoRepo: Repository<Photo>,
    @InjectRepository(Match) private matchRepo: Repository<Match>,
  ) {}

  async trackBehavior(data: {
    userId: string;
    targetUserId: string;
    action: UserBehavior['action'];
    viewDurationMs?: number;
    targetAge?: number;
    targetGender?: string;
    targetInterests?: string[];
    targetJobTitle?: string;
    targetSchool?: string;
    targetCity?: string;
    distanceKm?: number;
    compatibilityScore?: number;
  }) {
    const behavior = this.behaviorRepo.create(data);
    await this.behaviorRepo.save(behavior);

    if (data.action === 'like' || data.action === 'super_like') {
      await this.updateEloOnLike(data.targetUserId, data.action === 'super_like');
    } else if (data.action === 'pass') {
      await this.updateEloOnPass(data.targetUserId);
    }

    if (data.action === 'view_profile') {
      await this.updateEloViews(data.targetUserId);
    }
  }

  async getUserPreferenceModel(userId: string) {
    const behaviors = await this.behaviorRepo.find({
      where: { userId, action: 'like' as any },
      order: { createdAt: 'DESC' },
      take: 200,
    });

    if (behaviors.length === 0) return null;

    const ageCounts = new Map<number, number>();
    const interestCounts = new Map<string, number>();
    const jobCounts = new Map<string, number>();
    const schoolCounts = new Map<string, number>();
    const cityCounts = new Map<string, number>();
    const genderCounts = new Map<string, number>();
    let totalDistance = 0;
    let distanceCount = 0;

    for (const b of behaviors) {
      if (b.targetAge) ageCounts.set(b.targetAge, (ageCounts.get(b.targetAge) || 0) + 1);
      if (b.targetGender) genderCounts.set(b.targetGender, (genderCounts.get(b.targetGender) || 0) + 1);
      if (b.targetInterests) {
        for (const interest of b.targetInterests) {
          interestCounts.set(interest, (interestCounts.get(interest) || 0) + 1);
        }
      }
      if (b.targetJobTitle) jobCounts.set(b.targetJobTitle, (jobCounts.get(b.targetJobTitle) || 0) + 1);
      if (b.targetSchool) schoolCounts.set(b.targetSchool, (schoolCounts.get(b.targetSchool) || 0) + 1);
      if (b.targetCity) cityCounts.set(b.targetCity, (cityCounts.get(b.targetCity) || 0) + 1);
      if (b.distanceKm) { totalDistance += b.distanceKm; distanceCount++; }
    }

    const avgAge = behaviors.reduce((sum, b) => sum + (b.targetAge || 0), 0) / behaviors.length;
    const avgDistance = distanceCount > 0 ? totalDistance / distanceCount : 0;

    return {
      avgLikedAge: Math.round(avgAge),
      avgLikedDistance: Math.round(avgDistance),
      topInterests: [...interestCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k]) => k),
      topJobs: [...jobCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k),
      topSchools: [...schoolCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k),
      topCities: [...cityCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k),
      preferredGender: [...genderCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0],
    };
  }

  async calculateBehavioralScore(userId: string, candidateId: string): Promise<number> {
    const model = await this.getUserPreferenceModel(userId);
    if (!model) return 0.5;

    const candidateBehaviors = await this.behaviorRepo.find({
      where: { targetUserId: candidateId },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    let score = 0.5;

    if (candidateBehaviors.length > 0) {
      const likesOnCandidate = candidateBehaviors.filter((b) => b.action === 'like' || b.action === 'super_like').length;
      const popularScore = Math.min(likesOnCandidate / 10, 1);
      score += popularScore * 0.2;
    }

    const passRate = candidateBehaviors.filter((b) => b.action === 'pass').length / Math.max(candidateBehaviors.length, 1);
    score -= passRate * 0.15;

    return Math.max(0, Math.min(1, score));
  }

  async updateEloOnLike(userId: string, isSuperLike = false) {
    let elo = await this.eloRepo.findOne({ where: { userId } });
    if (!elo) {
      elo = this.eloRepo.create({ userId, score: 1200 });
    }
    elo.totalLikesReceived++;
    if (isSuperLike) elo.score = Number(elo.score) + 15;
    else elo.score = Number(elo.score) + 10;
    await this.eloRepo.save(elo);
  }

  async updateEloOnPass(userId: string) {
    let elo = await this.eloRepo.findOne({ where: { userId } });
    if (!elo) {
      elo = this.eloRepo.create({ userId, score: 1200 });
    }
    elo.score = Number(elo.score) - 5;
    await this.eloRepo.save(elo);
  }

  async updateEloViews(userId: string) {
    let elo = await this.eloRepo.findOne({ where: { userId } });
    if (!elo) {
      elo = this.eloRepo.create({ userId, score: 1200 });
    }
    elo.profileViews++;
    await this.eloRepo.save(elo);
  }

  async updateEloOnMatch(userId: string) {
    let elo = await this.eloRepo.findOne({ where: { userId } });
    if (!elo) {
      elo = this.eloRepo.create({ userId, score: 1200 });
    }
    elo.totalMatches++;
    elo.score = Number(elo.score) + 25;
    await this.eloRepo.save(elo);
  }

  async updateEloOnConversation(userId: string) {
    let elo = await this.eloRepo.findOne({ where: { userId } });
    if (!elo) {
      elo = this.eloRepo.create({ userId, score: 1200 });
    }
    elo.totalConversations++;
    elo.score = Number(elo.score) + 20;
    await this.eloRepo.save(elo);
  }

  async calculateEloScore(userId: string): Promise<number> {
    const elo = await this.eloRepo.findOne({ where: { userId } });
    return elo ? Number(elo.score) : 1200;
  }

  async calculateMutualScore(userId: string, candidateId: string): Promise<number> {
    const myBehavior = await this.behaviorRepo.findOne({
      where: { userId: candidateId, targetUserId: userId },
      order: { createdAt: 'DESC' },
    });

    if (myBehavior && (myBehavior.action === 'like' || myBehavior.action === 'super_like')) {
      return 1.0;
    }

    if (myBehavior && myBehavior.action === 'pass') {
      return 0.0;
    }

    const theirModel = await this.getUserPreferenceModel(candidateId);
    if (!theirModel) return 0.5;

    return 0.5;
  }

  async calculateActivityScore(userId: string): Promise<number> {
    const recentBehaviors = await this.behaviorRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    if (recentBehaviors.length === 0) return 0.3;

    const lastActivity = recentBehaviors[0].createdAt;
    const hoursSinceActive = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60);

    if (hoursSinceActive < 1) return 1.0;
    if (hoursSinceActive < 6) return 0.8;
    if (hoursSinceActive < 24) return 0.6;
    if (hoursSinceActive < 72) return 0.4;
    return 0.2;
  }

  async trackPhotoView(photoId: string, userId: string, viewDurationMs: number) {
    let analytics = await this.photoAnalyticsRepo.findOne({ where: { photoId } });
    if (!analytics) {
      analytics = this.photoAnalyticsRepo.create({ photoId, userId });
    }
    analytics.totalViews++;
    const totalDuration = Number(analytics.avgViewDurationMs) * (analytics.totalViews - 1) + viewDurationMs;
    analytics.avgViewDurationMs = totalDuration / analytics.totalViews;
    analytics.updatedAt = new Date();
    await this.photoAnalyticsRepo.save(analytics);
  }

  async trackPhotoLike(photoId: string, userId: string) {
    let analytics = await this.photoAnalyticsRepo.findOne({ where: { photoId } });
    if (!analytics) {
      analytics = this.photoAnalyticsRepo.create({ photoId, userId });
    }
    analytics.likesReceived++;
    analytics.conversionRate = analytics.totalViews > 0
      ? analytics.likesReceived / analytics.totalViews
      : 0;
    analytics.updatedAt = new Date();
    await this.photoAnalyticsRepo.save(analytics);
  }

  async trackPhotoPass(photoId: string, userId: string) {
    let analytics = await this.photoAnalyticsRepo.findOne({ where: { photoId } });
    if (!analytics) {
      analytics = this.photoAnalyticsRepo.create({ photoId, userId });
    }
    analytics.passesAfterView++;
    analytics.conversionRate = analytics.totalViews > 0
      ? analytics.likesReceived / analytics.totalViews
      : 0;
    analytics.updatedAt = new Date();
    await this.photoAnalyticsRepo.save(analytics);
  }

  async getOptimalPhotoOrder(userId: string): Promise<string[]> {
    const analytics = await this.photoAnalyticsRepo.find({
      where: { userId },
      order: { conversionRate: 'DESC' },
    });

    if (analytics.length === 0) {
      const photos = await this.photoRepo.find({
        where: { profileId: userId },
        order: { order: 'ASC' },
      });
      return photos.map((p) => p.id);
    }

    return analytics.map((a) => a.photoId);
  }

  async trackConversationSignal(userId: string, matchId: string, data: {
    messagesSent?: number;
    messagesReceived?: number;
    avgMessageLength?: number;
    avgResponseTimeMinutes?: number;
    responseRate?: number;
  }) {
    let signal = await this.convSignalRepo.findOne({ where: { userId, matchId } });
    if (!signal) {
      signal = this.convSignalRepo.create({ userId, matchId });
    }
    if (data.messagesSent !== undefined) signal.messagesSent += data.messagesSent;
    if (data.messagesReceived !== undefined) signal.messagesReceived += data.messagesReceived;
    if (data.avgMessageLength !== undefined) signal.avgMessageLength = data.avgMessageLength;
    if (data.avgResponseTimeMinutes !== undefined) signal.avgResponseTimeMinutes = data.avgResponseTimeMinutes;
    if (data.responseRate !== undefined) signal.responseRate = data.responseRate;
    signal.updatedAt = new Date();
    await this.convSignalRepo.save(signal);
  }

  async calculateConversationQualityScore(userId: string, candidateId: string): Promise<number> {
    const matches = await this.matchRepo.find({
      where: [
        { user1Id: userId, user2Id: candidateId },
        { user1Id: candidateId, user2Id: userId },
      ],
    });

    if (matches.length === 0) return 0.5;

    const matchId = matches[0].id;
    const mySignals = await this.convSignalRepo.findOne({ where: { userId, matchId } });
    const theirSignals = await this.convSignalRepo.findOne({ where: { userId: candidateId, matchId } });

    if (!mySignals && !theirSignals) return 0.5;

    let score = 0.5;
    if (mySignals) {
      score += mySignals.responseRate * 0.3;
      if (mySignals.avgResponseTimeMinutes < 30) score += 0.1;
      else if (mySignals.avgResponseTimeMinutes < 120) score += 0.05;
    }
    if (theirSignals) {
      score += theirSignals.responseRate * 0.3;
      if (theirSignals.avgResponseTimeMinutes < 30) score += 0.1;
      else if (theirSignals.avgResponseTimeMinutes < 120) score += 0.05;
    }

    return Math.max(0, Math.min(1, score));
  }

  async calculateOverallScore(userId: string, candidateId: string, compatibilityScore: number): Promise<number> {
    const [behavioralScore, mutualScore, activityScore, eloScore, conversationScore] = await Promise.all([
      this.calculateBehavioralScore(userId, candidateId),
      this.calculateMutualScore(userId, candidateId),
      this.calculateActivityScore(candidateId),
      this.calculateEloScore(candidateId),
      this.calculateConversationQualityScore(userId, candidateId),
    ]);

    const eloNormalized = Math.max(0, Math.min(1, (eloScore - 800) / 800));

    const overallScore =
      compatibilityScore * 0.30 +
      behavioralScore * 0.20 +
      mutualScore * 0.20 +
      activityScore * 0.15 +
      eloNormalized * 0.10 +
      conversationScore * 0.05;

    return Math.max(0, Math.min(1, overallScore));
  }
}

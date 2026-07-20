import { Injectable, Logger } from '@nestjs/common';
import { CompatibilityEngine, CompatibilityResult } from './compatibility.engine';
import { CandidateGenerator, CandidateProfile } from './candidate.generator';
import { DiversityInjector, RankedCandidate } from './diversity.injector';
import { BehaviorAnalyzer, BehavioralAnalysis } from './behavior.analyzer';
import { ScamDetector, ScamAnalysis } from './scam.detector';
import { IcebreakerGenerator, IceBreaker } from './icebreaker.generator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like, Pass, Match, Profile, User } from '@app/common/entities';

export interface MatchFeedItem {
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
  compatibilityScore: number;
  compatibility: CompatibilityResult;
  icebreakers: IceBreaker[];
  safetyScore: number;
}

export interface CompatibilityScoreResponse {
  userId: string;
  targetUserId: string;
  compatibility: CompatibilityResult;
  icebreakers: IceBreaker[];
}

@Injectable()
export class MatchmakingEngine {
  private readonly logger = new Logger(MatchmakingEngine.name);

  constructor(
    private compatibilityEngine: CompatibilityEngine,
    private candidateGenerator: CandidateGenerator,
    private diversityInjector: DiversityInjector,
    private behaviorAnalyzer: BehaviorAnalyzer,
    private scamDetector: ScamDetector,
    private icebreakerGenerator: IcebreakerGenerator,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(Like) private likeRepo: Repository<Like>,
    @InjectRepository(Pass) private passRepo: Repository<Pass>,
    @InjectRepository(Match) private matchRepo: Repository<Match>,
  ) {}

  async generateFeed(userId: string, page = 1, limit = 20): Promise<MatchFeedItem[]> {
    const skip = (page - 1) * limit;

    const candidates = await this.candidateGenerator.generate(userId, 200);

    const ranked: RankedCandidate[] = [];
    for (const candidate of candidates) {
      try {
        const compatibility = await this.compatibilityEngine.score(userId, candidate.userId);
        ranked.push({
          ...candidate,
          compatibilityScore: compatibility.overallScore,
          compatibility,
          finalScore: compatibility.overallScore,
        });
      } catch (err) {
        this.logger.warn(`Failed to score ${candidate.userId}: ${err.message}`);
      }
    }

    const diversified = this.diversityInjector.inject(ranked, 0.3, limit + skip + 10);

    const sliced = diversified.slice(skip, skip + limit);

    const feed: MatchFeedItem[] = [];
    for (const item of sliced) {
      const behavioral = await this.behaviorAnalyzer.analyze(item.userId);
      const icebreakers = await this.icebreakerGenerator.generate(
        await this.getUserProfile(userId),
        item,
        item.compatibility,
      );

      feed.push({
        userId: item.userId,
        fullName: item.fullName,
        age: item.age,
        gender: item.gender,
        bio: item.bio,
        jobTitle: item.jobTitle,
        city: item.city,
        distanceKm: item.distanceKm,
        verified: item.verified,
        completionPercentage: item.completionPercentage,
        photos: item.photos,
        interests: item.interests,
        relationshipGoal: item.relationshipGoal,
        compatibilityScore: item.compatibilityScore,
        compatibility: item.compatibility,
        icebreakers,
        safetyScore: behavioral.safetyScore,
      });
    }

    return feed;
  }

  async getCompatibilityScore(userId: string, targetUserId: string): Promise<CompatibilityScoreResponse> {
    const compatibility = await this.compatibilityEngine.score(userId, targetUserId);
    const targetProfile = await this.profileRepo.findOne({ where: { userId: targetUserId } });
    const targetUser = await this.userRepo.findOne({ where: { id: targetUserId } });
    const userProfile = await this.getUserProfile(userId);

    const candidateProfile: CandidateProfile = {
      userId: targetUserId,
      fullName: targetUser?.fullName || '',
      age: targetProfile?.dateOfBirth ? this.calculateAge(targetProfile.dateOfBirth) : 0,
      gender: targetProfile?.gender || '',
      bio: targetProfile?.bio || '',
      jobTitle: targetProfile?.jobTitle || '',
      city: targetProfile?.city || '',
      distanceKm: 0,
      verified: targetProfile?.verified || false,
      completionPercentage: targetProfile?.completionPercentage || 0,
      photos: [],
      interests: [],
      relationshipGoal: targetProfile?.relationshipGoal || '',
    };

    const icebreakers = await this.icebreakerGenerator.generate(userProfile, candidateProfile, compatibility);

    return { userId, targetUserId, compatibility, icebreakers };
  }

  async checkScamRisk(userId: string, targetUserId: string): Promise<ScamAnalysis> {
    return this.scamDetector.analyzeConversation(userId, targetUserId);
  }

  async getBehavioralAnalysis(userId: string): Promise<BehavioralAnalysis> {
    return this.behaviorAnalyzer.analyze(userId);
  }

  private async getUserProfile(userId: string): Promise<Profile | null> {
    return this.profileRepo.findOne({ where: { userId } });
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
}

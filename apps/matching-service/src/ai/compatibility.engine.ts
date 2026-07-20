import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile, ProfileInterest, UserPreference } from '@app/common/entities';

export interface CompatibilityBreakdown {
  interestOverlap: number;
  lifestyleCompatibility: number;
  valuesAlignment: number;
  communicationStyle: number;
  goalAlignment: number;
}

export interface CompatibilityResult {
  overallScore: number;
  breakdown: CompatibilityBreakdown;
  sharedInterests: string[];
  insights: string[];
}

const WEIGHTS: Record<keyof CompatibilityBreakdown, number> = {
  interestOverlap: 0.25,
  lifestyleCompatibility: 0.20,
  valuesAlignment: 0.30,
  communicationStyle: 0.15,
  goalAlignment: 0.10,
};

@Injectable()
export class CompatibilityEngine {
  constructor(
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(ProfileInterest) private profileInterestRepo: Repository<ProfileInterest>,
    @InjectRepository(UserPreference) private prefRepo: Repository<UserPreference>,
  ) {}

  async score(userId: string, candidateId: string): Promise<CompatibilityResult> {
    const [userProfile, candidateProfile] = await Promise.all([
      this.profileRepo.findOne({ where: { userId } }),
      this.profileRepo.findOne({ where: { userId: candidateId } }),
    ]);

    if (!userProfile || !candidateProfile) {
      return { overallScore: 0, breakdown: this.emptyBreakdown(), sharedInterests: [], insights: [] };
    }

    const [userInterests, candidateInterests] = await Promise.all([
      this.getUserInterestNames(userProfile.id),
      this.getUserInterestNames(candidateProfile.id),
    ]);

    const userPrefs = await this.prefRepo.findOne({ where: { userId } });

    const breakdown: CompatibilityBreakdown = {
      interestOverlap: this.interestScore(userInterests, candidateInterests),
      lifestyleCompatibility: this.lifestyleScore(userProfile, candidateProfile),
      valuesAlignment: this.valuesScore(userProfile, candidateProfile),
      communicationStyle: this.communicationScore(userProfile, candidateProfile),
      goalAlignment: this.goalScore(userProfile, candidateProfile, userPrefs),
    };

    const overallScore = Number(
      (Object.keys(breakdown) as (keyof CompatibilityBreakdown)[])
        .reduce((sum, key) => sum + breakdown[key] * WEIGHTS[key], 0)
        .toFixed(2),
    );

    const sharedInterests = userInterests.filter(i => candidateInterests.includes(i));
    const insights = this.generateInsights(breakdown, sharedInterests, userProfile, candidateProfile);

    return { overallScore, breakdown, sharedInterests, insights };
  }

  private interestScore(userInterests: string[], candidateInterests: string[]): number {
    // M1: Return 0 when either list is empty instead of defaulting to 0.5
    if (!userInterests.length || !candidateInterests.length) return 0;
    const userSet = new Set(userInterests.map(i => i.toLowerCase()));
    const candSet = new Set(candidateInterests.map(i => i.toLowerCase()));
    const intersection = [...userSet].filter(i => candSet.has(i));
    const union = new Set([...userSet, ...candSet]);
    return union.size > 0 ? Number((intersection.length / union.size).toFixed(2)) : 0;
  }

  private lifestyleScore(user: Profile, candidate: Profile): number {
    let score = 0.5;

    if (user.school && candidate.school && user.school === candidate.school) {
      score += 0.15;
    }

    if (user.city && candidate.city && user.city === candidate.city) {
      score += 0.1;
    }

    if (user.jobTitle && candidate.jobTitle) {
      const userJobLower = user.jobTitle.toLowerCase();
      const candJobLower = candidate.jobTitle.toLowerCase();
      if (userJobLower === candJobLower) score += 0.1;
      else if (userJobLower.split(' ').some(w => candJobLower.includes(w))) score += 0.05;
    }

    if (user.prompts && candidate.prompts && Array.isArray(user.prompts) && Array.isArray(candidate.prompts)) {
      const userAnswers = user.prompts.map((p: any) => (p.answer || '').toLowerCase());
      const candAnswers = candidate.prompts.map((p: any) => (p.answer || '').toLowerCase());
      const commonWords = userAnswers.flatMap(a => a.split(/\s+/)).filter(w => w.length > 3);
      const candWords = candAnswers.flatMap(a => a.split(/\s+/)).filter(w => w.length > 3);
      if (commonWords.length && candWords.length) {
        const overlap = commonWords.filter(w => candWords.includes(w));
        score += Math.min(overlap.length / Math.max(commonWords.length, 1), 0.15);
      }
    }

    return Number(Math.min(score, 1).toFixed(2));
  }

  private valuesScore(user: Profile, candidate: Profile): number {
    let score = 0.5;

    if (user.verified && candidate.verified) score += 0.1;
    if (user.completionPercentage >= 70 && candidate.completionPercentage >= 70) score += 0.1;

    if (user.prompts && candidate.prompts && Array.isArray(user.prompts) && Array.isArray(candidate.prompts)) {
      const valueKeywords = ['family', 'faith', 'honest', 'loyal', 'respect', 'kind', 'ambitious', 'growth', 'trust', 'commitment'];
      const userText = user.prompts.map((p: any) => (p.answer || '').toLowerCase()).join(' ');
      const candText = candidate.prompts.map((p: any) => (p.answer || '').toLowerCase()).join(' ');
      const userMatches = valueKeywords.filter(k => userText.includes(k));
      const candMatches = valueKeywords.filter(k => candText.includes(k));
      const overlap = userMatches.filter(k => candMatches.includes(k));
      score += Math.min(overlap.length * 0.05, 0.2);
    }

    return Number(Math.min(score, 1).toFixed(2));
  }

  private communicationScore(user: Profile, candidate: Profile): number {
    let score = 0.5;

    const userBioLen = (user.bio || '').length;
    const candBioLen = (candidate.bio || '').length;
    const bioRatio = Math.min(userBioLen, candBioLen) / Math.max(userBioLen, candBioLen || 1);
    if (bioRatio > 0.3) score += 0.15;

    const userPromptCount = Array.isArray(user.prompts) ? user.prompts.length : 0;
    const candPromptCount = Array.isArray(candidate.prompts) ? candidate.prompts.length : 0;
    if (userPromptCount >= 2 && candPromptCount >= 2) score += 0.1;

    return Number(Math.min(score, 1).toFixed(2));
  }

  private goalScore(user: Profile, candidate: Profile, prefs?: UserPreference | null): number {
    let score = 0.5;

    if (user.relationshipGoal && candidate.relationshipGoal) {
      if (user.relationshipGoal === candidate.relationshipGoal) {
        score += 0.3;
      } else {
        const compatMap: Record<string, string[]> = {
          long_term: ['long_term', 'marriage'],
          marriage: ['marriage', 'long_term'],
          casual: ['casual', 'short_term'],
          short_term: ['short_term', 'casual'],
          unsure: ['casual', 'short_term', 'long_term', 'marriage', 'unsure'],
        };
        const compatGoals = compatMap[user.relationshipGoal] || [];
        if (compatGoals.includes(candidate.relationshipGoal)) score += 0.15;
      }
    }

    return Number(Math.min(score, 1).toFixed(2));
  }

  private async getUserInterestNames(profileId: string): Promise<string[]> {
    const profileInterests = await this.profileInterestRepo.find({
      where: { profileId },
      relations: ['interest'],
    });
    return profileInterests
      .map(pi => pi.interest?.name)
      .filter((name): name is string => !!name);
  }

  private generateInsights(
    breakdown: CompatibilityBreakdown,
    sharedInterests: string[],
    user: Profile,
    candidate: Profile,
  ): string[] {
    const insights: string[] = [];

    if (sharedInterests.length >= 3) {
      insights.push(`You share ${sharedInterests.length} interests including ${sharedInterests.slice(0, 3).join(', ')}`);
    } else if (sharedInterests.length > 0) {
      insights.push(`You both enjoy ${sharedInterests.join(' and ')}`);
    }

    if (breakdown.valuesAlignment >= 0.7) {
      insights.push('High compatibility in values and life priorities');
    }

    if (breakdown.goalAlignment >= 0.7) {
      insights.push(`You both seem interested in ${user.relationshipGoal?.replace('_', ' ') || 'similar relationship goals'}`);
    }

    if (breakdown.lifestyleCompatibility >= 0.6) {
      insights.push('Your lifestyles appear to be well-matched');
    }

    if (breakdown.communicationStyle >= 0.6) {
      insights.push('You both express yourselves similarly in your profiles');
    }

    if (user.city && candidate.city && user.city === candidate.city) {
      insights.push(`You're both in ${user.city}`);
    }

    return insights;
  }

  private emptyBreakdown(): CompatibilityBreakdown {
    return { interestOverlap: 0, lifestyleCompatibility: 0, valuesAlignment: 0, communicationStyle: 0, goalAlignment: 0 };
  }
}

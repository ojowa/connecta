import { Injectable } from '@nestjs/common';
import { CandidateProfile } from './candidate.generator';
import { CompatibilityResult } from './compatibility.engine';

export interface RankedCandidate extends CandidateProfile {
  compatibilityScore: number;
  compatibility: CompatibilityResult;
  finalScore: number;
}

@Injectable()
export class DiversityInjector {
  inject(
    candidates: RankedCandidate[],
    diversityFactor = 0.3,
    targetSize = 20,
  ): RankedCandidate[] {
    if (candidates.length <= targetSize) {
      return candidates.sort((a, b) => b.finalScore - a.finalScore);
    }

    const sorted = [...candidates].sort((a, b) => b.finalScore - a.finalScore);

    const diverse: RankedCandidate[] = [];
    const seenJobCategories = new Set<string>();
    const seenCities = new Set<string>();
    const seenGoalBuckets = new Map<string, number>();

    for (const candidate of sorted) {
      if (diverse.length >= targetSize) break;

      const diversityScore = this.calculateDiversityScore(
        candidate,
        seenJobCategories,
        seenCities,
        seenGoalBuckets,
      );

      const finalScore =
        (1 - diversityFactor) * candidate.compatibilityScore +
        diversityFactor * diversityScore;

      diverse.push({ ...candidate, finalScore: Number(finalScore.toFixed(3)) });
    }

    return diverse.sort((a, b) => b.finalScore - a.finalScore);
  }

  private calculateDiversityScore(
    candidate: RankedCandidate,
    seenJobCategories: Set<string>,
    seenCities: Set<string>,
    seenGoalBuckets: Map<string, number>,
  ): number {
    let score = 0;

    const jobCategory = candidate.jobTitle || 'unknown';
    if (!seenJobCategories.has(jobCategory)) {
      score += 0.4;
      seenJobCategories.add(jobCategory);
    }

    const city = candidate.city || 'unknown';
    if (!seenCities.has(city)) {
      score += 0.3;
      seenCities.add(city);
    }

    const goal = candidate.relationshipGoal || 'unknown';
    const goalCount = seenGoalBuckets.get(goal) || 0;
    if (goalCount < 3) {
      score += 0.3;
      seenGoalBuckets.set(goal, goalCount + 1);
    }

    return Math.min(score, 1);
  }
}

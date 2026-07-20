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
    const seenEducation = new Set<string>();
    const seenCities = new Set<string>();
    const seenGoalBuckets = new Map<string, number>();

    for (const candidate of sorted) {
      if (diverse.length >= targetSize) break;

      const diversityScore = this.calculateDiversityScore(
        candidate,
        seenEducation,
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
    seenEducation: Set<string>,
    seenCities: Set<string>,
    seenGoalBuckets: Map<string, number>,
  ): number {
    let score = 0;

    const education = candidate.jobTitle || 'unknown';
    if (!seenEducation.has(education)) {
      score += 0.4;
      seenEducation.add(education);
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

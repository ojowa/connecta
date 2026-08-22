import { Injectable } from '@nestjs/common';
import { CandidateProfile } from './candidate.generator';
import { CompatibilityResult } from './compatibility.engine';
import { Profile } from '@app/common/entities';

export interface IceBreaker {
  id: string;
  text: string;
  category: 'interest' | 'lifestyle' | 'values' | 'fun' | 'location';
  confidence: number;
}

@Injectable()
export class IcebreakerGenerator {
  async generate(
    userProfile: Profile | null,
    candidateProfile: CandidateProfile,
    compatibility: CompatibilityResult,
  ): Promise<IceBreaker[]> {
    const icebreakers: IceBreaker[] = [];

    if (compatibility.sharedInterests.length > 0) {
      for (const interest of compatibility.sharedInterests.slice(0, 3)) {
        icebreakers.push({
          id: `interest-${interest.toLowerCase().replace(/\s+/g, '-')}`,
          text: `I see we both love ${interest}! What got you into it?`,
          category: 'interest',
          confidence: 0.9,
        });
      }
    }

    if (candidateProfile.jobTitle && userProfile?.jobTitle) {
      if (candidateProfile.jobTitle === userProfile.jobTitle) {
        icebreakers.push({
          id: 'same-job',
          text: `Fellow ${candidateProfile.jobTitle}! What's the best part of your job?`,
          category: 'lifestyle',
          confidence: 0.85,
        });
      } else {
        icebreakers.push({
          id: 'different-job',
          text: `I'm curious about your work as a ${candidateProfile.jobTitle} - what do you enjoy most about it?`,
          category: 'lifestyle',
          confidence: 0.7,
        });
      }
    }

    if (candidateProfile.city && userProfile?.city) {
      if (candidateProfile.city === userProfile.city) {
        icebreakers.push({
          id: 'same-city',
          text: `We're both in ${candidateProfile.city}! What's your favorite hidden spot here?`,
          category: 'location',
          confidence: 0.8,
        });
      }
    }

    if (candidateProfile.relationshipGoal === userProfile?.relationshipGoal) {
      const goalText = this.getGoalIcebreaker(candidateProfile.relationshipGoal);
      if (goalText) {
        icebreakers.push({
          id: `goal-${candidateProfile.relationshipGoal}`,
          text: goalText,
          category: 'values',
          confidence: 0.75,
        });
      }
    }

    if (candidateProfile.bio) {
      const bioTopics = this.extractBioTopics(candidateProfile.bio);
      for (const topic of bioTopics.slice(0, 2)) {
        icebreakers.push({
          id: `bio-${topic.toLowerCase().replace(/\s+/g, '-')}`,
          text: `You mentioned ${topic} in your profile - tell me more about that!`,
          category: 'fun',
          confidence: 0.65,
        });
      }
    }

    const generic = [
      "What's the most spontaneous thing you've ever done?",
      'If you could have dinner with anyone, living or dead, who would it be?',
      "What's something you've always wanted to try but haven't yet?",
    ];

    for (let i = 0; i < Math.min(2, generic.length); i++) {
      icebreakers.push({
        id: `generic-${i}`,
        text: generic[i],
        category: 'fun',
        confidence: 0.5,
      });
    }

    return icebreakers.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }

  private getGoalIcebreaker(goal?: string): string | null {
    const map: Record<string, string> = {
      long_term:
        "I'm also looking for something meaningful - what does a great relationship look like to you?",
      marriage:
        "It's refreshing to meet someone serious about marriage - what values do you think are most important?",
      casual: 'Always good to be upfront - what does casual dating look like for you?',
      short_term: 'I appreciate the honesty - what are you hoping to find right now?',
      unsure: "It's okay to be unsure - what would make you feel ready to commit?",
    };
    return map[goal || ''] || null;
  }

  private extractBioTopics(bio: string): string[] {
    const topics: string[] = [];
    const patterns = [
      /I love ([^.,!?]+)/gi,
      /I enjoy ([^.,!?]+)/gi,
      /I'm passionate about ([^.,!?]+)/gi,
      /I'm into ([^.,!?]+)/gi,
      /favorite (?:thing|hobby) is ([^.,!?]+)/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(bio)) !== null) {
        if (match[1] && match[1].trim().length > 2 && match[1].trim().length < 50) {
          topics.push(match[1].trim());
        }
      }
    }

    if (topics.length === 0) {
      const words = bio.split(/\s+/).filter((w) => w.length > 4);
      if (words.length >= 3) {
        topics.push(words.slice(0, 2).join(' '));
      }
    }

    return topics;
  }
}
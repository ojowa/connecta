import { Injectable } from '@nestjs/common';

export interface ToxicityResult {
  isToxic: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'severe';
  score: number;
  categories: string[];
  action: 'allow' | 'warn' | 'block';
}

const TOXIC_PATTERNS: Record<string, { patterns: RegExp[]; weight: number }> = {
  hate_speech: {
    patterns: [
      /\b(n[i1]gg?[ae3]r|f[a4]gg?[0o]t|k[i1]ke|ch[i1]nk|sp[i1]c|w[a@]p|tr[a@]nn?[y3])\b/i,
      /\b(r[e3]t[a@]rd|cr[i1]pp?l[e3]|d[u3]mb|st[u3]p[i1]d)\b.*\b(idiot|moron|loser)\b/i,
    ],
    weight: 1.0,
  },
  threats: {
    patterns: [
      /\b(kill|murder|stab|shoot|beat\s+up|hurt|destroy)\b.*\b(you|them|him|her)\b/i,
      /\bi('ll| will)\b.*\b(kill|murder|find\s+you|end\s+you|hurt|destroy)\b/i,
      /\b(you('re|\s+are)\b.*\b(dead|finished|done)\b)/i,
      /\b(bomb|explosive|gun|weapon)\b/i,
    ],
    weight: 0.95,
  },
  sexual_harassment: {
    patterns: [
      /\b(send|share|show)\b.*\b(nudes?|pics?|photos?|pictures?)\b.*\b(you|me|now)\b/i,
      /\bi('ll| will)\b.*\b(rape|molest|assault)\b/i,
      /\b(you('re|\s+are)\b.*\b(fuckable|hot\s+enough|asking\s+for\s+it))\b/i,
      /\b(slut|whore|slag|hoe)\b/i,
    ],
    weight: 0.9,
  },
  spam_scam: {
    patterns: [
      /\b(click\s+here|buy\s+now|limited\s+offer|act\s+now|free\s+money)\b/i,
      /\b(whatsapp|telegram|signal|viber)\b.*\b(number|link|group)\b/i,
      /\b(dm|message|text)\b.*\b(me|my)\s+(number|ig|insta|snap)\b/i,
      /(https?:\/\/[^\s]+){2,}/i,
    ],
    weight: 0.6,
  },
  profanity: {
    patterns: [
      /\b(f+u+c+k+|f+u+k+|f+a+c+k+)\b/i,
      /\b(s+h+[i1]+t+)\b/i,
      /\b(a+s+s+h+o+l+e+)\b/i,
      /\b(b+i+t+c+h+)\b/i,
      /\b(d+a+m+n+)\b/i,
      /\b(c+o+c+k+)\b/i,
    ],
    weight: 0.3,
  },
  bullying: {
    patterns: [
      /\b(nobody\s+likes\s+you|you('re|\s+are)\s+worthless|go\s+kill\s+yourself|kys)\b/i,
      /\b(ugly|fat|disgusting|pathetic|loser|lifeless)\b/i,
      /\b(you('re|\s+are)\b.*\b(waste|nothing|trash|garbage))\b/i,
    ],
    weight: 0.8,
  },
};

@Injectable()
export class ToxicityDetector {
  analyze(text: string): ToxicityResult {
    if (!text || text.trim().length === 0) {
      return { isToxic: false, severity: 'none', score: 0, categories: [], action: 'allow' };
    }

    const matchedCategories: { category: string; weight: number }[] = [];
    let maxWeight = 0;

    for (const [category, config] of Object.entries(TOXIC_PATTERNS)) {
      for (const pattern of config.patterns) {
        if (pattern.test(text)) {
          matchedCategories.push({ category, weight: config.weight });
          maxWeight = Math.max(maxWeight, config.weight);
          break;
        }
      }
    }

    const countBonus = Math.min(matchedCategories.length * 0.05, 0.2);
    const score = Number(Math.min(maxWeight + countBonus, 1).toFixed(2));

    const categories = matchedCategories.map((c) => c.category);
    const severity = this.getSeverity(score);
    const action = this.getAction(score, maxWeight);

    return { isToxic: score > 0.3, severity, score, categories, action };
  }

  private getSeverity(score: number): ToxicityResult['severity'] {
    if (score >= 0.9) return 'severe';
    if (score >= 0.7) return 'high';
    if (score >= 0.5) return 'medium';
    if (score >= 0.3) return 'low';
    return 'none';
  }

  private getAction(score: number, maxWeight: number): ToxicityResult['action'] {
    if (maxWeight >= 0.9 || score >= 0.85) return 'block';
    if (score >= 0.5) return 'warn';
    return 'allow';
  }
}

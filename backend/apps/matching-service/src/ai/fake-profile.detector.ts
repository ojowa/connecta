import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User, Profile, Photo, Message, Like, Report, Session, Block } from '@app/common/entities';

export interface FakeProfileResult {
  isLikelyFake: boolean;
  riskScore: number;
  flags: string[];
  confidence: number;
}

const STOCK_PHOTO_SIGNALS = [
  /model/i,
  /stock/i,
  /professional/i,
  /headshot/i,
  /studio/i,
];

const BOT_MESSAGE_PATTERNS = [
  /\b(hi|hello|hey)\s+(dear|baby|sweetie|honey|beautiful|handsome)\b/i,
  /\b(are\s+you\s+online|what\s+are\s+you\s+wearing|send\s+pic)\b/i,
  /\b(i\s+am\s+from|my\s+name\s+is|i\s+work\s+as)\b.*\b(let's\s+chat|whatsapp|telegram)\b/i,
  /https?:\/\/[^\s]+/gi,
];

@Injectable()
export class FakeProfileDetector {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(Photo) private photoRepo: Repository<Photo>,
    @InjectRepository(Message) private msgRepo: Repository<Message>,
    @InjectRepository(Like) private likeRepo: Repository<Like>,
    @InjectRepository(Report) private reportRepo: Repository<Report>,
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
    @InjectRepository(Block) private blockRepo: Repository<Block>,
  ) {}

  async analyze(userId: string): Promise<FakeProfileResult> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return { isLikelyFake: true, riskScore: 1, flags: ['user_not_found'], confidence: 1 };

    const profile = await this.profileRepo.findOne({ where: { userId } });
    const flags: string[] = [];
    let riskScore = 0;

    const now = new Date();
    const accountAgeDays = (now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);

    const [photoCount, messageCount, likeCount, reportCount, blockCount, sessionCount] =
      await Promise.all([
        this.photoRepo.count({ where: { profileId: profile?.id || '' } }),
        this.msgRepo.count({ where: { senderId: userId } }),
        this.likeRepo.count({ where: { userId } }),
        this.reportRepo.count({ where: { reportedId: userId } }),
        this.blockRepo.count({ where: { blockedId: userId } }),
        this.sessionRepo.count({ where: { userId } }),
      ]);

    if (photoCount === 0) {
      flags.push('no_photos');
      riskScore += 0.25;
    } else if (photoCount === 1) {
      flags.push('single_photo');
      riskScore += 0.1;
    }

    if (!profile?.bio || profile.bio.trim().length < 10) {
      flags.push('minimal_bio');
      riskScore += 0.1;
    }

    if (profile?.completionPercentage !== undefined && profile.completionPercentage < 40) {
      flags.push('incomplete_profile');
      riskScore += 0.15;
    }

    const missingFields = [
      !profile?.jobTitle,
      !profile?.school,
      !profile?.city,
      !profile?.relationshipGoal,
      !user.dateOfBirth,
      !user.gender,
    ].filter(Boolean).length;
    if (missingFields >= 4) {
      flags.push('many_missing_fields');
      riskScore += 0.15;
    }

    if (profile?.bio) {
      for (const pattern of STOCK_PHOTO_SIGNALS) {
        if (pattern.test(profile.bio)) {
          flags.push('stock_photo_signal_in_bio');
          riskScore += 0.15;
          break;
        }
      }
    }

    if (accountAgeDays < 1 && messageCount > 50) {
      flags.push('new_account_mass_messaging');
      riskScore += 0.3;
    }

    if (accountAgeDays < 7 && likeCount > 200) {
      flags.push('new_account_like_spam');
      riskScore += 0.25;
    }

    if (reportCount >= 3) {
      flags.push('multiple_reports');
      riskScore += 0.3;
    } else if (reportCount >= 1) {
      flags.push('has_reports');
      riskScore += 0.1;
    }

    if (blockCount >= 5) {
      flags.push('frequently_blocked');
      riskScore += 0.25;
    }

    if (sessionCount > 10) {
      flags.push('many_sessions');
      riskScore += 0.1;
    }

    if (profile?.prompts && Array.isArray(profile.prompts)) {
      const totalLength = profile.prompts.reduce((sum: number, p: any) => sum + (p.answer?.length || 0), 0);
      if (profile.prompts.length > 0 && totalLength < 20) {
        flags.push('low_effort_prompts');
        riskScore += 0.1;
      }
    }

    const recentMessages = await this.msgRepo.find({
      where: { senderId: userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    if (recentMessages.length >= 5) {
      const botMatches = recentMessages.filter((m) =>
        BOT_MESSAGE_PATTERNS.some((p) => p.test(m.content || '')),
      ).length;
      if (botMatches >= 3) {
        flags.push('bot_message_patterns');
        riskScore += 0.25;
      }
    }

    if (recentMessages.length >= 5) {
      const lengths = recentMessages.map((m) => (m.content || '').length);
      const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
      if (variance < 10 && recentMessages.length >= 10) {
        flags.push('repetitive_message_length');
        riskScore += 0.1;
      }
    }

    const finalRisk = Math.min(riskScore, 1);
    const confidence = Math.min(0.5 + flags.length * 0.1, 1);

    return {
      isLikelyFake: finalRisk > 0.5,
      riskScore: Number(finalRisk.toFixed(2)),
      flags,
      confidence: Number(confidence.toFixed(2)),
    };
  }
}

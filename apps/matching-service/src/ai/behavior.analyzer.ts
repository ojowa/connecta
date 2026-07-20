import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User, Profile, Message, Like, Report, Photo, Session } from '@app/common/entities';

export interface BehavioralAnalysis {
  riskScore: number;
  flags: string[];
  isSuspicious: boolean;
  safetyScore: number;
}

@Injectable()
export class BehaviorAnalyzer {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(Message) private msgRepo: Repository<Message>,
    @InjectRepository(Like) private likeRepo: Repository<Like>,
    @InjectRepository(Report) private reportRepo: Repository<Report>,
    @InjectRepository(Photo) private photoRepo: Repository<Photo>,
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
  ) {}

  async analyze(userId: string): Promise<BehavioralAnalysis> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return { riskScore: 1, flags: ['user_not_found'], isSuspicious: true, safetyScore: 0 };

    const profile = await this.profileRepo.findOne({ where: { userId } });
    const flags: string[] = [];
    let riskScore = 0;

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const accountAgeMs = now.getTime() - user.createdAt.getTime();
    const accountAgeDays = accountAgeMs / (24 * 60 * 60 * 1000);

    const [messages24h, likesGiven24h, totalLikes, totalReports, photoCount, sessionCount] = await Promise.all([
      this.msgRepo.count({ where: { senderId: userId, createdAt: MoreThan(oneDayAgo) } }),
      this.likeRepo.count({ where: { userId, createdAt: MoreThan(oneDayAgo) } }),
      this.likeRepo.count({ where: { userId } }),
      this.reportRepo.count({ where: { reportedId: userId } }),
      this.photoRepo.count({ where: { profileId: profile?.id || '' } }),
      this.sessionRepo.count({ where: { userId } }),
    ]);

    if (messages24h > 200) {
      flags.push('mass_messaging');
      riskScore += 0.4;
    } else if (messages24h > 100) {
      flags.push('high_message_volume');
      riskScore += 0.2;
    }

    if (likesGiven24h > 100) {
      flags.push('like_spam');
      riskScore += 0.3;
    } else if (likesGiven24h > 50) {
      flags.push('high_like_volume');
      riskScore += 0.15;
    }

    if (accountAgeDays < 1 && (messages24h > 50 || likesGiven24h > 30)) {
      flags.push('new_account_high_activity');
      riskScore += 0.3;
    }

    if (photoCount === 0) {
      flags.push('no_photos');
      riskScore += 0.2;
    } else if (photoCount === 1) {
      flags.push('single_photo');
      riskScore += 0.1;
    }

    if (profile && !profile.bio) {
      flags.push('no_bio');
      riskScore += 0.1;
    }

    if (profile && profile.completionPercentage < 30) {
      flags.push('incomplete_profile');
      riskScore += 0.15;
    }

    if (!user.emailVerified && !user.phoneVerified) {
      flags.push('unverified_contact');
      riskScore += 0.1;
    }

    if (totalReports >= 3) {
      flags.push('multiple_reports');
      riskScore += 0.3;
    } else if (totalReports >= 1) {
      flags.push('has_reports');
      riskScore += 0.1;
    }

    if (sessionCount > 5) {
      flags.push('multiple_devices');
      riskScore += 0.1;
    }

    const finalRisk = Math.min(riskScore, 1);
    const safetyScore = Math.round((1 - finalRisk) * 100);

    return {
      riskScore: Number(finalRisk.toFixed(2)),
      flags,
      isSuspicious: finalRisk > 0.5,
      safetyScore,
    };
  }
}

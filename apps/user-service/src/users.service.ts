import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Profile, UserPreference, Block, Report, Photo } from '@app/common/entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(UserPreference) private prefRepo: Repository<UserPreference>,
    @InjectRepository(Block) private blockRepo: Repository<Block>,
    @InjectRepository(Report) private reportRepo: Repository<Report>,
    @InjectRepository(Photo) private photoRepo: Repository<Photo>,
  ) {}

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const profile = await this.profileRepo.findOne({ where: { userId } });
    const photos = profile
      ? await this.photoRepo.find({ where: { profileId: profile.id }, order: { order: 'ASC' } })
      : [];
    const { passwordHash, ...userData } = user;
    return { ...userData, profile: profile || null, photos };
  }

  async updateMe(userId: string, data: any) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const allowed = ['fullName', 'dateOfBirth', 'gender'];
    const updates: any = {};
    for (const key of allowed) {
      if (data[key] !== undefined) updates[key] = data[key];
    }
    if (Object.keys(updates).length > 0) await this.userRepo.update(userId, updates);
    let profile = await this.profileRepo.findOne({ where: { userId } });
    const profileFields = [
      'bio',
      'jobTitle',
      'company',
      'school',
      'city',
      'country',
      'relationshipGoal',
      'latitude',
      'longitude',
    ];
    const profileUpdates: any = {};
    for (const key of profileFields) {
      if (data[key] !== undefined) profileUpdates[key] = data[key];
    }
    if (Object.keys(profileUpdates).length > 0) {
      if (!profile) {
        profile = new Profile();
        profile.userId = userId;
        profile.firstName = user.fullName || 'User';
        Object.assign(profile, profileUpdates);
      } else {
        Object.assign(profile, profileUpdates);
      }
      await this.profileRepo.save(profile);
    }
    return { updatedFields: [...Object.keys(updates), ...Object.keys(profileUpdates)] };
  }

  async getPublicProfile(userId: string, viewerId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const blocked = await this.blockRepo.findOne({
      where: [
        { blockerId: viewerId, blockedId: userId },
        { blockerId: userId, blockedId: viewerId },
      ],
    });
    if (blocked) throw new BadRequestException('Cannot view this profile');
    const profile = await this.profileRepo.findOne({ where: { userId } });
    const photos = profile
      ? await this.photoRepo.find({ where: { profileId: profile.id }, order: { order: 'ASC' } })
      : [];
    return {
      id: user.id,
      fullName: user.fullName,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      profile,
      photos,
    };
  }

  async updatePreferences(userId: string, data: any) {
    let prefs = await this.prefRepo.findOne({ where: { userId } });
    if (!prefs) {
      prefs = new UserPreference();
      prefs.userId = userId;
      Object.assign(prefs, data);
    } else {
      Object.assign(prefs, data);
    }
    await this.prefRepo.save(prefs);
    return prefs;
  }

  async getPreferences(userId: string) {
    let prefs = await this.prefRepo.findOne({ where: { userId } });
    if (!prefs) {
      prefs = this.prefRepo.create({ userId });
      await this.prefRepo.save(prefs);
    }
    return prefs;
  }

  async blockUser(userId: string, targetUserId: string, reason?: string) {
    if (userId === targetUserId) throw new BadRequestException('Cannot block yourself');
    const existing = await this.blockRepo.findOne({
      where: { blockerId: userId, blockedId: targetUserId },
    });
    if (existing) return existing;
    const block = this.blockRepo.create({ blockerId: userId, blockedId: targetUserId, reason });
    return this.blockRepo.save(block);
  }

  async unblockUser(userId: string, targetUserId: string) {
    await this.blockRepo.delete({ blockerId: userId, blockedId: targetUserId });
    return { unblocked: true };
  }

  async getBlockedUsers(userId: string, page = 1, limit = 20) {
    const [blocked, total] = await this.blockRepo.findAndCount({
      where: { blockerId: userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { blockedUsers: blocked, meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async reportUser(userId: string, targetUserId: string, data: any) {
    const report = this.reportRepo.create({
      reporterId: userId,
      reportedId: targetUserId,
      reason: data.reason,
      description: data.description,
      evidenceUrls: data.evidenceUrls,
    });
    return this.reportRepo.save(report);
  }

  async deleteAccount(userId: string, password: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const bcrypt = require('bcryptjs');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new BadRequestException('Invalid password');
    await this.userRepo.update(userId, { status: 'deactivated' as any });
    return { deletionScheduled: true, gracePeriodDays: 30 };
  }

  async uploadPreKeys(userId: string, data: any) {
    return { success: true, uploaded: data.preKeys?.length || 0 };
  }

  async getPreKeys(userId: string) {
    return { preKeys: [] };
  }

  async getPreKeyBundle(userId: string) {
    return { identityKey: null, signedPreKey: null, preKeys: [] };
  }

  async createSession(userId: string, data: any) {
    return { sessionId: `session_${Date.now()}` };
  }

  async getSessions(userId: string) {
    return { sessions: [] };
  }

  async deleteSession(userId: string, sessionId: string) {
    return { deleted: true };
  }

  async backupKeys(userId: string, data: any) {
    return { backupId: `backup_${Date.now()}`, timestamp: new Date().toISOString() };
  }

  async getBackup(userId: string) {
    return { backup: null };
  }

  async getSyncDelta(userId: string, sinceTimestamp: number) {
    const sinceDate = new Date(sinceTimestamp);
    const profile = await this.profileRepo
      .createQueryBuilder('p')
      .where('p.userId = :userId', { userId })
      .andWhere('p.updatedAt > :since', { since: sinceDate })
      .getOne();

    return { data: profile };
  }
}

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
    const photos = profile ? await this.photoRepo.find({ where: { profileId: profile.id }, order: { order: 'ASC' } }) : [];
    const { passwordHash, ...userData } = user;
    return { ...userData, profile: profile || null, photos };
  }

  async updateMe(userId: string, data: any) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const allowed = ['fullName', 'dateOfBirth', 'gender', 'phone', 'email'];
    const updates: any = {};
    for (const key of allowed) { if (data[key] !== undefined) updates[key] = data[key]; }
    if (Object.keys(updates).length > 0) await this.userRepo.update(userId, updates);
    let profile = await this.profileRepo.findOne({ where: { userId } });
    const profileFields = ['bio', 'jobTitle', 'company', 'school', 'city', 'country', 'relationshipGoal', 'latitude', 'longitude'];
    const profileUpdates: any = {};
    for (const key of profileFields) { if (data[key] !== undefined) profileUpdates[key] = data[key]; }
    if (Object.keys(profileUpdates).length > 0) {
      if (!profile) { profile = new Profile(); profile.userId = userId; profile.firstName = user.fullName || 'User'; Object.assign(profile, profileUpdates); }
      else { Object.assign(profile, profileUpdates); }
      await this.profileRepo.save(profile);
    }
    return { updatedFields: [...Object.keys(updates), ...Object.keys(profileUpdates)] };
  }

  async getPublicProfile(userId: string, viewerId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const blocked = await this.blockRepo.findOne({ where: [{ blockerId: viewerId, blockedId: userId }, { blockerId: userId, blockedId: viewerId }] });
    if (blocked) throw new BadRequestException('Cannot view this profile');
    const profile = await this.profileRepo.findOne({ where: { userId } });
    const photos = profile ? await this.photoRepo.find({ where: { profileId: profile.id }, order: { order: 'ASC' } }) : [];
    return { id: user.id, fullName: user.fullName, dateOfBirth: user.dateOfBirth, gender: user.gender, profile, photos };
  }

  async updatePreferences(userId: string, data: any) {
    let prefs = await this.prefRepo.findOne({ where: { userId } });
    if (!prefs) { prefs = new UserPreference(); prefs.userId = userId; Object.assign(prefs, data); }
    else { Object.assign(prefs, data); }
    await this.prefRepo.save(prefs);
    return prefs;
  }

  async getPreferences(userId: string) {
    let prefs = await this.prefRepo.findOne({ where: { userId } });
    if (!prefs) { prefs = this.prefRepo.create({ userId }); await this.prefRepo.save(prefs); }
    return prefs;
  }

  async blockUser(userId: string, targetUserId: string, reason?: string) {
    if (userId === targetUserId) throw new BadRequestException('Cannot block yourself');
    const existing = await this.blockRepo.findOne({ where: { blockerId: userId, blockedId: targetUserId } });
    if (existing) return existing;
    const block = this.blockRepo.create({ blockerId: userId, blockedId: targetUserId, reason });
    return this.blockRepo.save(block);
  }

  async unblockUser(userId: string, targetUserId: string) {
    await this.blockRepo.delete({ blockerId: userId, blockedId: targetUserId });
    return { unblocked: true };
  }

  async getBlockedUsers(userId: string, page = 1, limit = 20) {
    const [blocked, total] = await this.blockRepo.findAndCount({ where: { blockerId: userId }, order: { id: 'DESC' }, skip: (page - 1) * limit, take: limit });
    return { blockedUsers: blocked, meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async reportUser(userId: string, targetUserId: string, data: any) {
    const report = this.reportRepo.create({ reporterId: userId, reportedId: targetUserId, reason: data.reason, description: data.description, evidenceUrls: data.evidenceUrls });
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

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const profile = await this.profileRepo.findOne({ where: { userId } });
    const photos = profile ? await this.photoRepo.find({ where: { profileId: profile.id }, order: { order: 'ASC' } }) : [];
    const { passwordHash, ...userData } = user;
    return { user: userData, profile: profile || null, photos };
  }

  async exportData(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const profile = await this.profileRepo.findOne({ where: { userId } });
    const photos = profile ? await this.photoRepo.find({ where: { profileId: profile.id } }) : [];
    const { passwordHash, ...userData } = user;
    return { user: userData, profile: profile || null, photos, exportedAt: new Date().toISOString(), message: 'Data export initiated.' };
  }

  async getSyncDelta(userId: string, sinceTimestamp: number) {
    const sinceDate = new Date(sinceTimestamp);
    const profile = await this.profileRepo.createQueryBuilder('p').where('p.userId = :userId', { userId }).andWhere('p.updatedAt > :since', { since: sinceDate }).getOne();
    return { data: profile };
  }

  async getPhotos(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) return { photos: [] };
    const photos = await this.photoRepo.find({ where: { profileId: profile.id }, order: { order: 'ASC' } });
    return { photos };
  }

  async addPhoto(userId: string, data: any) {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      const newProfile = this.profileRepo.create({ userId, firstName: user.fullName || 'User' });
      profile = await this.profileRepo.save(newProfile);
    }
    const existingPhotos = await this.photoRepo.find({ where: { profileId: profile.id } });
    const maxOrder = existingPhotos.length > 0 ? Math.max(...existingPhotos.map(p => p.order)) : 0;
    const photo = this.photoRepo.create({
      profileId: profile.id,
      url: data.url,
      thumbnailUrl: data.thumbnailUrl || null,
      order: data.order !== undefined ? data.order : maxOrder + 1,
      isPrimary: existingPhotos.length === 0,
    });
    return this.photoRepo.save(photo);
  }

  async deletePhoto(userId: string, photoId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    const photo = await this.photoRepo.findOne({ where: { id: photoId, profileId: profile.id } });
    if (!photo) throw new NotFoundException('Photo not found');
    await this.photoRepo.remove(photo);
    return { deleted: true };
  }

  async reorderPhotos(userId: string, orders: { id: string; order: number }[]) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    for (const item of orders) {
      await this.photoRepo.update({ id: item.id, profileId: profile.id }, { order: item.order });
    }
    return { reordered: true };
  }

  async setPrimaryPhoto(userId: string, photoId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    const photo = await this.photoRepo.findOne({ where: { id: photoId, profileId: profile.id } });
    if (!photo) throw new NotFoundException('Photo not found');
    await this.photoRepo.update({ profileId: profile.id }, { isPrimary: false });
    await this.photoRepo.update(photoId, { isPrimary: true, order: 0 });
    return { primary: true };
  }
}

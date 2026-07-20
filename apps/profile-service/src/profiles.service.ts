import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Profile, Photo, Interest, ProfileInterest } from '@app/common/entities';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(Photo) private photoRepo: Repository<Photo>,
    @InjectRepository(Interest) private interestRepo: Repository<Interest>,
    @InjectRepository(ProfileInterest) private piRepo: Repository<ProfileInterest>,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    const photos = await this.photoRepo.find({ where: { profileId: profile.id }, order: { order: 'ASC' } });
    const interests = await this.piRepo.find({ where: { profileId: profile.id } });
    return { ...profile, photos, interests };
  }

  async updateProfile(userId: string, data: any) {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    const allowed = ['bio', 'jobTitle', 'company', 'school', 'city', 'country', 'relationshipGoal', 'latitude', 'longitude'];
    for (const key of allowed) { if (data[key] !== undefined) (profile as any)[key] = data[key]; }
    if (data.interestIds) {
      await this.piRepo.delete({ profileId: profile.id });
      for (const interestId of data.interestIds) {
        await this.piRepo.save(this.piRepo.create({ profileId: profile.id, interestId }));
      }
    }
    profile.completionPercentage = this.calculateCompletion(profile);
    return this.profileRepo.save(profile);
  }

  async getPhotos(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    const photos = await this.photoRepo.find({ where: { profileId: profile.id }, order: { order: 'ASC' } });
    return { photos, total: photos.length, maxPhotos: 9 };
  }

  async uploadPhoto(userId: string, url: string, isPrimary = false) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    const count = await this.photoRepo.count({ where: { profileId: profile.id } });
    if (count >= 9) throw new BadRequestException('Maximum 9 photos allowed');
    if (isPrimary) await this.photoRepo.update({ profileId: profile.id }, { isPrimary: false });
    const photo = this.photoRepo.create({ profileId: profile.id, url, order: count + 1, isPrimary });
    return this.photoRepo.save(photo);
  }

  async deletePhoto(userId: string, photoId: string) {
    const photo = await this.photoRepo.findOne({ where: { id: photoId }, relations: ['profile'] });
    if (!photo || photo.profile.userId !== userId) throw new NotFoundException('Photo not found');
    await this.photoRepo.remove(photo);
    return { deleted: true, photoId };
  }

  async reorderPhotos(userId: string, photoIds: string[]) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    for (let i = 0; i < photoIds.length; i++) {
      await this.photoRepo.update(photoIds[i], { order: i + 1 });
    }
    return { reordered: true, photoIds };
  }

  async setPrimaryPhoto(userId: string, photoId: string) {
    const photo = await this.photoRepo.findOne({ where: { id: photoId }, relations: ['profile'] });
    if (!photo || photo.profile.userId !== userId) throw new NotFoundException('Photo not found');
    await this.photoRepo.update({ profileId: photo.profileId }, { isPrimary: false });
    await this.photoRepo.update(photoId, { isPrimary: true });
    return { photoId, isPrimary: true };
  }

  async getInterests() {
    return this.interestRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async requestVerification(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    if (profile.verified) return { status: 'already_verified', verifiedAt: profile.verifiedAt };

    // In production, create verification request and submit to third-party provider:
    // const verification = await this.verificationRepo.save({
    //   userId, profileId: profile.id, method: 'selfie', status: 'pending', submittedAt: new Date(),
    // });
    // Submit selfie to Jumio/Onfido/ManualReview

    return {
      verificationId: `vrf_${Date.now()}`,
      method: 'selfie',
      status: 'processing',
      submittedAt: new Date(),
      estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  async getVerificationStatus(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return {
      status: profile.verified ? 'approved' : 'not_requested',
      verified: profile.verified || false,
      verifiedAt: profile.verifiedAt || null,
      method: profile.verified ? 'selfie' : null,
    };
  }

  private calculateCompletion(profile: Profile): number {
    let score = 0;
    const checks = [profile.firstName, profile.bio, profile.dateOfBirth, profile.gender, profile.jobTitle, profile.school, profile.relationshipGoal];
    checks.forEach((c) => { if (c) score += Math.floor(100 / checks.length); });
    return Math.min(score, 100);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Profile, Photo } from '@app/common/entities';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(Photo) private photoRepo: Repository<Photo>,
  ) {}

  async searchUsers(userId: string, params: any) {
    const qb = this.profileRepo.createQueryBuilder('p').innerJoin('p.user', 'u').where('u.id != :userId', { userId }).andWhere('u.status = :status', { status: 'active' });
    if (params.q) qb.andWhere('(p.firstName ILIKE :q OR p.bio ILIKE :q)', { q: `%${params.q}%` });
    if (params.gender) qb.andWhere('p.gender = :gender', { gender: params.gender });
    if (params.verified) qb.andWhere('p.verified = true');
    if (params.relationshipGoal) qb.andWhere('p.relationshipGoal = :rg', { rg: params.relationshipGoal });
    const page = params.page || 1;
    const limit = params.limit || 20;
    qb.orderBy('p.completionPercentage', 'DESC').skip((page - 1) * limit).take(limit);
    const profiles = await qb.getMany();
    const total = await qb.getCount();
    return { results: profiles, meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async autocomplete(userId: string, query: string) {
    if (!query || query.length < 2) return { suggestions: [] };
    const profiles = await this.profileRepo.createQueryBuilder('p')
      .innerJoin('p.user', 'u')
      .where('p.firstName ILIKE :q', { q: `${query}%` })
      .andWhere('u.id != :userId', { userId })
      .andWhere('u.status = :status', { status: 'active' })
      .limit(10).getMany();
    return { suggestions: profiles.map(p => ({ text: p.firstName, type: 'name', userId: p.userId })) };
  }
}

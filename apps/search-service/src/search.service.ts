import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User, Profile, Photo } from '@app/common/entities';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
  ) {}

  async searchUsers(userId: string, query: string, page = 1, limit = 20) {
    const users = await this.userRepo.createQueryBuilder('u').leftJoinAndSelect('u.profile', 'p').where('u.fullName ILIKE :query', { query: `%${query}%` }).andWhere('u.id != :userId', { userId }).andWhere('u.status = :status', { status: 'active' }).skip((page - 1) * limit).take(limit).getMany();
    return { users: users.map((u) => ({ id: u.id, fullName: u.fullName, profile: (u as any).profile || null })), meta: { page, limit, hasMore: users.length === limit } };
  }

  async autocomplete(userId: string, query: string) {
    const users = await this.userRepo.createQueryBuilder('u').where('u.fullName ILIKE :query', { query: `%${query}%` }).andWhere('u.id != :userId', { userId }).take(10).getMany();
    return { suggestions: users.map((u) => ({ id: u.id, fullName: u.fullName })) };
  }
}

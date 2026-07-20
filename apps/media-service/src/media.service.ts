import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, User } from '@app/common/entities';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media) private mediaRepo: Repository<Media>,
  ) {}

  async upload(userId: string, data: any) {
    const media = await this.mediaRepo.save(this.mediaRepo.create({ userId, url: data.url, mimeType: data.mimeType || 'image/jpeg', sizeBytes: data.sizeBytes || 0, purpose: data.purpose || 'photo', status: 'active' }));
    return { media: { id: media.id, url: media.url, type: media.mimeType, sizeBytes: media.sizeBytes, purpose: media.purpose, uploadedAt: media.createdAt } };
  }

  async getPresignedUrl(userId: string, data: any) {
    const key = `media/${userId}/${uuid()}-${data.fileName}`;
    const cdnUrl = `https://cdn.connecta.app/${key}`;
    return { uploadUrl: `https://connecta-uploads.s3.amazonaws.com/${key}`, mediaId: uuid(), expiresIn: 300, cdnUrl };
  }

  async getMedia(id: string) {
    const media = await this.mediaRepo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  async deleteMedia(id: string) {
    const media = await this.mediaRepo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    await this.mediaRepo.remove(media);
    return { deleted: true, id };
  }
}

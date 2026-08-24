import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '@app/common/entities';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MediaService {
  constructor(@InjectRepository(Media) private mediaRepo: Repository<Media>) {}

  async upload(userId: string, data: any) {
    const media = this.mediaRepo.create({ userId, url: data.url || `https://storage.connecta.app/${uuid()}`, mimeType: data.mimeType, sizeBytes: data.sizeBytes, purpose: data.purpose || 'profile', metadata: data.metadata });
    return this.mediaRepo.save(media);
  }

  async getPresignedUrl(userId: string, data: any) {
    const key = `uploads/${userId}/${uuid()}.${data.mimeType?.split('/')[1] || 'bin'}`;
    return { uploadUrl: `https://s3.amazonaws.com/connecta-storage/${key}?X-Amz-Signature=placeholder`, key, expiresAt: new Date(Date.now() + 15 * 60 * 1000) };
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
    return { deleted: true };
  }
}

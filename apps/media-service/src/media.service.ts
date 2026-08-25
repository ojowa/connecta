import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '@app/common/entities';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MediaService {
  constructor(@InjectRepository(Media) private mediaRepo: Repository<Media>) {}

  async upload(userId: string, data: any, file?: Express.Multer.File) {
    let url: string;
    let mimeType = data.mimeType;
    let sizeBytes = data.sizeBytes;

    if (file) {
      url = `https://storage.ojchat.app/${userId}/${uuid()}.${file.originalname.split('.').pop() || 'jpg'}`;
      mimeType = file.mimetype;
      sizeBytes = file.size;
    } else if (data.url) {
      url = data.url;
    } else {
      throw new BadRequestException('No file or URL provided');
    }

    const media = this.mediaRepo.create({
      userId,
      url,
      mimeType,
      sizeBytes,
      purpose: data.purpose || 'profile',
      metadata: data.metadata,
    });
    return this.mediaRepo.save(media);
  }

  async getPresignedUrl(userId: string, data: any) {
    const key = `uploads/${userId}/${uuid()}.${data.mimeType?.split('/')[1] || 'bin'}`;
    return { uploadUrl: `https://s3.amazonaws.com/ojchat-storage/${key}?X-Amz-Signature=placeholder`, key, expiresAt: new Date(Date.now() + 15 * 60 * 1000) };
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

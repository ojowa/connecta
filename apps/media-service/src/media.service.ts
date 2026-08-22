import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, User } from '@app/common/entities';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MediaService {
  constructor(@InjectRepository(Media) private mediaRepo: Repository<Media>) {}

  async upload(userId: string, data: any) {
    const media = await this.mediaRepo.save(
      this.mediaRepo.create({
        userId,
        url: data.url || data.cdnUrl,
        mimeType: data.mimeType || 'image/jpeg',
        sizeBytes: data.sizeBytes || 0,
        purpose: data.purpose || 'photo',
        status: 'active',
        metadata: data.key ? JSON.stringify({ key: data.key }) : undefined,
      }),
    );
    return {
      media: {
        id: media.id,
        url: media.url,
        type: media.mimeType,
        sizeBytes: media.sizeBytes,
        purpose: media.purpose,
        uploadedAt: media.createdAt,
      },
    };
  }

  async getPresignedUrl(userId: string, data: any) {
    const key = `media/${userId}/${uuid()}-${data.filename || 'upload'}`;
    const cdnUrl = `${process.env.CDN_URL || 'https://cdn.connecta.app'}/${key}`;

    // In production, use AWS S3:
    // import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
    // import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
    // const s3 = new S3Client({ region: process.env.AWS_REGION });
    // const command = new PutObjectCommand({
    //   Bucket: process.env.S3_BUCKET || 'connecta-uploads',
    //   Key: key,
    //   ContentType: data.contentType || 'image/jpeg',
    //   Metadata: { userId },
    // });
    // const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return {
      uploadUrl: `https://${process.env.S3_BUCKET || 'connecta-uploads'}.s3.${process.env.AWS_REGION || 'eu-west-1'}.amazonaws.com/${key}`,
      key,
      mediaId: uuid(),
      expiresIn: 300,
      cdnUrl,
    };
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

import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, SystemSetting } from '@app/common/entities';
import { StorageProvider, createStorageProvider, StorageConfig } from '@app/common/storage';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MediaService implements OnModuleInit {
  private storage: StorageProvider;
  private readonly SETTINGS_KEY = 'platform_settings';

  constructor(
    @InjectRepository(Media) private mediaRepo: Repository<Media>,
    @InjectRepository(SystemSetting) private settingsRepo: Repository<SystemSetting>,
  ) {}

  async onModuleInit() {
    this.storage = await this.createProvider();
  }

  private async createProvider(): Promise<StorageProvider> {
    const record = await this.settingsRepo.findOne({ where: { key: this.SETTINGS_KEY } });
    const settings = record?.value || {};
    const storageConfig: StorageConfig = {
      provider: settings.storageProvider || 'local',
      local: { uploadDir: settings.storageLocal?.uploadDir, baseUrl: settings.storageLocal?.baseUrl || 'http://localhost:3006/media/files' },
      s3: settings.storageS3,
      r2: settings.storageR2,
    };
    return createStorageProvider(storageConfig);
  }

  private async getStorage(): Promise<StorageProvider> {
    if (!this.storage) this.storage = await this.createProvider();
    return this.storage;
  }

  async reloadStorage() {
    this.storage = await this.createProvider();
    return { reloaded: true, provider: (this.storage as any).constructor.name };
  }

  async upload(userId: string, data: any, file?: Express.Multer.File) {
    const storage = await this.getStorage();
    let url: string;
    let key: string;
    let mimeType = data.mimeType || 'application/octet-stream';
    let sizeBytes = data.sizeBytes || 0;

    if (file) {
      const result = await storage.upload(file, userId);
      url = result.url;
      key = result.key;
      mimeType = result.mimeType;
      sizeBytes = result.sizeBytes;
    } else if (data.url) {
      url = data.url;
      key = `external/${userId}/${uuid()}`;
    } else {
      throw new BadRequestException('No file or URL provided');
    }

    const media = this.mediaRepo.create({
      userId, url, key, mimeType, sizeBytes,
      purpose: data.purpose || 'profile',
      metadata: data.metadata,
      thumbnailUrl: data.thumbnailUrl,
    });
    return this.mediaRepo.save(media);
  }

  async getPresignedUrl(userId: string, data: any) {
    const storage = await this.getStorage();
    const ext = data.mimeType?.split('/')[1] || 'bin';
    const key = `uploads/${userId}/${uuid()}.${ext}`;
    const uploadUrl = await storage.getSignedUrl(key);
    return { uploadUrl, key, expiresAt: new Date(Date.now() + 15 * 60 * 1000) };
  }

  async getMedia(id: string) {
    const media = await this.mediaRepo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  async deleteMedia(id: string) {
    const media = await this.mediaRepo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    if (media.key) {
      const storage = await this.getStorage();
      await storage.delete(media.key).catch(() => {});
    }
    await this.mediaRepo.remove(media);
    return { deleted: true };
  }

  async getStorageConfig() {
    const record = await this.settingsRepo.findOne({ where: { key: this.SETTINGS_KEY } });
    const settings = record?.value || {};
    return {
      activeProvider: settings.storageProvider || 'local',
      local: { configured: true },
      s3: { configured: !!(settings.storageS3?.accessKeyId) },
      r2: { configured: !!(settings.storageR2?.accessKeyId) },
    };
  }
}

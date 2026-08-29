import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { StorageProvider, StorageUploadResult } from './storage-provider.interface';

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;
  private baseUrl: string;

  constructor(config: { uploadDir?: string; baseUrl?: string }) {
    this.uploadDir = config.uploadDir || path.join(process.cwd(), 'uploads');
    this.baseUrl = config.baseUrl || 'http://localhost:3006/media/files';
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, userId: string): Promise<StorageUploadResult> {
    const ext = path.extname(file.originalname) || '.bin';
    const key = `${userId}/${uuid()}${ext}`;
    const filePath = path.join(this.uploadDir, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, file.buffer);
    return { url: this.getPublicUrl(key), key, sizeBytes: file.size, mimeType: file.mimetype };
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  async getSignedUrl(key: string, _expiresInSec?: number): Promise<string> {
    return this.getPublicUrl(key);
  }

  getPublicUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }

  getFilePath(key: string): string {
    return path.join(this.uploadDir, key);
  }
}

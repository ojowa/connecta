import { v4 as uuid } from 'uuid';
import { StorageProvider, StorageUploadResult } from './storage-provider.interface';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl?: string;
}

export class R2StorageProvider implements StorageProvider {
  private config: R2Config;

  constructor(config: R2Config) {
    this.config = config;
  }

  async upload(file: Express.Multer.File, userId: string): Promise<StorageUploadResult> {
    const ext = (file.originalname.split('.').pop() || 'bin');
    const key = `uploads/${userId}/${uuid()}.${ext}`;
    // TODO: Install @aws-sdk/client-s3 and implement real upload (R2 uses S3-compatible API)
    // const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    // const client = new S3Client({ region: 'auto', endpoint: `https://${this.config.accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId: this.config.accessKeyId, secretAccessKey: this.config.secretAccessKey } });
    // await client.send(new PutObjectCommand({ Bucket: this.config.bucket, Key: key, Body: file.buffer, ContentType: file.mimetype }));
    return { url: this.getPublicUrl(key), key, sizeBytes: file.size, mimeType: file.mimetype };
  }

  async delete(key: string): Promise<void> {
    // TODO: Implement R2 delete
  }

  async getSignedUrl(key: string, expiresInSec = 3600): Promise<string> {
    return this.getPublicUrl(key);
  }

  getPublicUrl(key: string): string {
    return `${this.config.publicUrl || `https://${this.config.bucket}.r2.dev`}/${key}`;
  }
}

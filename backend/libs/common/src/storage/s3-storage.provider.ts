import { v4 as uuid } from 'uuid';
import { StorageProvider, StorageUploadResult } from './storage-provider.interface';

export interface S3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint?: string;
  forcePathStyle?: boolean;
}

export class S3StorageProvider implements StorageProvider {
  private config: S3Config;

  constructor(config: S3Config) {
    this.config = config;
  }

  async upload(file: Express.Multer.File, userId: string): Promise<StorageUploadResult> {
    const ext = (file.originalname.split('.').pop() || 'bin');
    const key = `uploads/${userId}/${uuid()}.${ext}`;
    // TODO: Install @aws-sdk/client-s3 and implement real upload
    // const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    // const client = new S3Client({ region: this.config.region, credentials: { accessKeyId: this.config.accessKeyId, secretAccessKey: this.config.secretAccessKey }, endpoint: this.config.endpoint, forcePathStyle: this.config.forcePathStyle });
    // await client.send(new PutObjectCommand({ Bucket: this.config.bucket, Key: key, Body: file.buffer, ContentType: file.mimetype }));
    return { url: this.getPublicUrl(key), key, sizeBytes: file.size, mimeType: file.mimetype };
  }

  async delete(key: string): Promise<void> {
    // TODO: Implement S3 delete
    // const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
    // const client = new S3Client({ ... });
    // await client.send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }));
  }

  async getSignedUrl(key: string, expiresInSec = 3600): Promise<string> {
    // TODO: Implement presigned URL generation
    return this.getPublicUrl(key);
  }

  getPublicUrl(key: string): string {
    if (this.config.endpoint) {
      return `${this.config.endpoint}/${this.config.bucket}/${key}`;
    }
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
  }
}

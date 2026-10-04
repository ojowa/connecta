export interface StorageUploadResult {
  url: string;
  key: string;
  sizeBytes: number;
  mimeType: string;
}

export interface StorageProvider {
  upload(file: Express.Multer.File, userId: string): Promise<StorageUploadResult>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresInSec?: number): Promise<string>;
  getPublicUrl(key: string): string;
}

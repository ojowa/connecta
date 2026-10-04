import { StorageProvider } from './storage-provider.interface';
import { LocalStorageProvider } from './local-storage.provider';
import { S3StorageProvider } from './s3-storage.provider';
import { R2StorageProvider } from './r2-storage.provider';

export interface StorageConfig {
  provider: 'local' | 's3' | 'r2';
  local?: { uploadDir?: string; baseUrl?: string };
  s3?: { region: string; accessKeyId: string; secretAccessKey: string; bucket: string; endpoint?: string };
  r2?: { accountId: string; accessKeyId: string; secretAccessKey: string; bucket: string; publicUrl?: string };
}

export function createStorageProvider(config: StorageConfig): StorageProvider {
  switch (config.provider) {
    case 's3':
      return new S3StorageProvider(config.s3!);
    case 'r2':
      return new R2StorageProvider(config.r2!);
    case 'local':
    default:
      return new LocalStorageProvider(config.local || {});
  }
}

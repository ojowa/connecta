import * as os from 'os';
import { createStorageProvider, StorageConfig } from './factory';
import { LocalStorageProvider } from './local-storage.provider';
import { S3StorageProvider } from './s3-storage.provider';
import { R2StorageProvider } from './r2-storage.provider';

const s3Config: StorageConfig['s3'] = {
  region: 'us-east-1',
  accessKeyId: 'key',
  secretAccessKey: 'secret',
  bucket: 'bucket',
};

const r2Config: StorageConfig['r2'] = {
  accountId: 'acct',
  accessKeyId: 'key',
  secretAccessKey: 'secret',
  bucket: 'bucket',
};

describe('createStorageProvider', () => {
  it('creates an S3 provider for s3', () => {
    const provider = createStorageProvider({
      provider: 's3',
      s3: s3Config,
    });
    expect(provider).toBeInstanceOf(S3StorageProvider);
  });

  it('creates an R2 provider for r2', () => {
    const provider = createStorageProvider({
      provider: 'r2',
      r2: r2Config,
    });
    expect(provider).toBeInstanceOf(R2StorageProvider);
  });

  it('creates a local provider for local', () => {
    const provider = createStorageProvider({
      provider: 'local',
      local: { uploadDir: os.tmpdir() },
    });
    expect(provider).toBeInstanceOf(LocalStorageProvider);
  });

  it('falls back to the local provider for an unknown provider', () => {
    const provider = createStorageProvider({
      provider: 'unknown' as unknown as StorageConfig['provider'],
      local: { uploadDir: os.tmpdir() },
    });
    expect(provider).toBeInstanceOf(LocalStorageProvider);
  });
});

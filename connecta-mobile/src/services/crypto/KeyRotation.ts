import { KeyManager } from './KeyManager';
import { DEFAULT_KEY_ROTATION_CONFIG, KeyRotationConfig, SignedPreKey, OneTimePreKey } from '../../types/crypto';

export class KeyRotation {
  private config: KeyRotationConfig;

  constructor(config?: Partial<KeyRotationConfig>) {
    this.config = { ...DEFAULT_KEY_ROTATION_CONFIG, ...config };
  }

  async checkAndRotate(): Promise<{
    rotatedSignedPreKey: boolean;
    replenishedOneTimePreKeys: boolean;
    oneTimePreKeyCount: number;
  }> {
    const result = {
      rotatedSignedPreKey: false,
      replenishedOneTimePreKeys: false,
      oneTimePreKeyCount: 0,
    };

    const shouldRotateSPK = await this.shouldRotateSignedPreKey();
    if (shouldRotateSPK) {
      await this.rotateSignedPreKey();
      result.rotatedSignedPreKey = true;
    }

    const opkCount = await KeyManager.getOneTimePreKeyCount();
    result.oneTimePreKeyCount = opkCount;

    if (opkCount < this.config.oneTimePreKeyThreshold) {
      await this.replenishOneTimePreKeys();
      result.replenishedOneTimePreKeys = true;
      result.oneTimePreKeyCount = await KeyManager.getOneTimePreKeyCount();
    }

    return result;
  }

  async shouldRotateSignedPreKey(): Promise<boolean> {
    const latestSPK = await KeyManager.getLatestSignedPreKey();
    if (!latestSPK) return true;

    const rotationMs = this.config.signedPreKeyRotationDays * 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - latestSPK.createdAt;

    return elapsed >= rotationMs;
  }

  async rotateSignedPreKey(): Promise<SignedPreKey> {
    const identityKeyPair = await KeyManager.getIdentityKeyPair();
    if (!identityKeyPair) {
      throw new Error('No identity key pair found');
    }

    const db = await (await import('../../database/connection')).getDatabase();
    const row = await db.getFirstAsync<{ max_key_id: number }>(
      `SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) as max_key_id
       FROM local_encryption_keys WHERE key_type = 'signed_pre_key'`,
    );
    const nextKeyId = (row?.max_key_id || 0) + 1;

    const signedPreKey = await KeyManager.generateSignedPreKey(
      identityKeyPair.privateKey,
      nextKeyId,
    );

    await KeyManager.storeSignedPreKey(signedPreKey);

    return signedPreKey;
  }

  async replenishOneTimePreKeys(): Promise<OneTimePreKey[]> {
    const db = await (await import('../../database/connection')).getDatabase();
    const row = await db.getFirstAsync<{ max_key_id: number }>(
      `SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) as max_key_id
       FROM local_encryption_keys WHERE key_type = 'one_time_pre_key'`,
    );
    const nextStartId = (row?.max_key_id || 0) + 1;

    const newKeys = await KeyManager.generateOneTimePreKeys(
      nextStartId,
      this.config.oneTimePreKeyBatchSize,
    );

    await KeyManager.storeOneTimePreKeys(newKeys);

    return newKeys;
  }

  async getPreKeyBundle(): Promise<{
    identityKey: string;
    signedPreKeyId: number;
    signedPreKey: string;
    signedPreKeySignature: string;
    oneTimePreKeyId: number;
    oneTimePreKey: string;
  }> {
    const identityKeyPair = await KeyManager.getIdentityKeyPair();
    if (!identityKeyPair) {
      throw new Error('No identity key pair found');
    }

    const signedPreKey = await KeyManager.getLatestSignedPreKey();
    if (!signedPreKey) {
      throw new Error('No signed pre key found');
    }

    const oneTimePreKeys = await KeyManager.getUnusedOneTimePreKeys();
    if (oneTimePreKeys.length === 0) {
      await this.replenishOneTimePreKeys();
      const refreshedKeys = await KeyManager.getUnusedOneTimePreKeys();
      if (refreshedKeys.length === 0) {
        throw new Error('Failed to generate one time pre keys');
      }
      const opk = refreshedKeys[0];
      await KeyManager.markOneTimePreKeyUsed(opk.keyId);
      return {
        identityKey: identityKeyPair.publicKey,
        signedPreKeyId: signedPreKey.keyId,
        signedPreKey: signedPreKey.publicKey,
        signedPreKeySignature: signedPreKey.signature,
        oneTimePreKeyId: opk.keyId,
        oneTimePreKey: opk.publicKey,
      };
    }

    const opk = oneTimePreKeys[0];
    await KeyManager.markOneTimePreKeyUsed(opk.keyId);

    return {
      identityKey: identityKeyPair.publicKey,
      signedPreKeyId: signedPreKey.keyId,
      signedPreKey: signedPreKey.publicKey,
      signedPreKeySignature: signedPreKey.signature,
      oneTimePreKeyId: opk.keyId,
      oneTimePreKey: opk.publicKey,
    };
  }

  async initOnAppLaunch(): Promise<void> {
    const identityKeyPair = await KeyManager.getIdentityKeyPair();
    if (!identityKeyPair) {
      const newIdentityKeyPair = await KeyManager.generateIdentityKeyPair();
      await KeyManager.storeIdentityKeyPair(newIdentityKeyPair);
    }

    const latestSPK = await KeyManager.getLatestSignedPreKey();
    if (!latestSPK) {
      await this.rotateSignedPreKey();
    }

    const opkCount = await KeyManager.getOneTimePreKeyCount();
    if (opkCount < this.config.oneTimePreKeyThreshold) {
      await this.replenishOneTimePreKeys();
    }
  }
}

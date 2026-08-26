import * as Crypto from 'expo-crypto';
import { KeyManager } from './KeyManager';
import { MediaEncryptor } from './MediaEncryptor';
import { secureStorage } from '../storage/secureStorage';
import { BackupData } from '../../types/crypto';

const BACKUP_SERVICE = 'com.ojchat.backup';

export class SecureBackup {
  async backupKeys(masterPassword: string): Promise<BackupData> {
    const salt = await KeyManager.generateRandomBytes(32);
    const backupKey = await this.deriveBackupKey(masterPassword, salt);

    const identityKeyPair = await KeyManager.getIdentityKeyPair();
    const latestSPK = await KeyManager.getLatestSignedPreKey();

    const keysToBackup: Record<string, any> = {
      identityKeyPair: identityKeyPair || null,
      signedPreKey: latestSPK || null,
      deviceId: await this.getDeviceId(),
    };

    const iv = await KeyManager.generateRandomBytes(16);
    const encryptedBundle = await MediaEncryptor.aesEncrypt(
      JSON.stringify(keysToBackup),
      backupKey,
      iv,
    );

    const verificationMac = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      'ojchat-backup-verify:' + backupKey + ':' + encryptedBundle,
    );

    const backupData: BackupData = {
      encryptedBundle,
      verificationMac,
      salt,
      iterations: 600000,
      deviceId: keysToBackup.deviceId,
      timestamp: Date.now(),
    };

    await secureStorage.set(`${BACKUP_SERVICE}.last`, JSON.stringify(backupData));

    return backupData;
  }

  async restoreKeys(backupData: BackupData, masterPassword: string): Promise<void> {
    const backupKey = await this.deriveBackupKey(masterPassword, backupData.salt);

    const iv = await KeyManager.generateRandomBytes(16);
    const decrypted = await MediaEncryptor.aesDecrypt(
      backupData.encryptedBundle,
      backupKey,
      iv,
    );

    const keys = JSON.parse(decrypted);

    if (keys.identityKeyPair) {
      await KeyManager.storeIdentityKeyPair(keys.identityKeyPair);
    }

    if (keys.signedPreKey) {
      await KeyManager.storeSignedPreKey(keys.signedPreKey);
    }
  }

  async verifyBackupPassword(masterPassword: string): Promise<boolean> {
    const lastBackup = await secureStorage.get(`${BACKUP_SERVICE}.last`);
    if (!lastBackup) return false;

    const backupData: BackupData = JSON.parse(lastBackup);
    const backupKey = await this.deriveBackupKey(masterPassword, backupData.salt);

    const expectedMac = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      'ojchat-backup-verify:' + backupKey + ':' + backupData.encryptedBundle,
    );

    return this.constantTimeCompare(
      KeyManager.hexToBytes(backupData.verificationMac),
      KeyManager.hexToBytes(expectedMac),
    );
  }

  private constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
  }

  async hasBackup(): Promise<boolean> {
    const lastBackup = await secureStorage.get(`${BACKUP_SERVICE}.last`);
    return !!lastBackup;
  }

  async getLastBackupInfo(): Promise<{ timestamp: number; deviceId: string } | null> {
    const lastBackup = await secureStorage.get(`${BACKUP_SERVICE}.last`);
    if (!lastBackup) return null;
    const data: BackupData = JSON.parse(lastBackup);
    return { timestamp: data.timestamp, deviceId: data.deviceId };
  }

  async deleteBackup(): Promise<void> {
    await secureStorage.remove(`${BACKUP_SERVICE}.last`);
  }

  private async deriveBackupKey(
    password: string,
    salt: string,
  ): Promise<string> {
    const iterations = 600000;

    let derived = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password + ':' + salt + ':0',
    );

    for (let i = 1; i < iterations; i++) {
      const hmac = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        derived + ':' + password + ':' + salt + ':' + i,
      );
      derived = hmac;
    }

    return derived;
  }

  private async getDeviceId(): Promise<string> {
    let deviceId = await secureStorage.get(`${BACKUP_SERVICE}.deviceId`);
    if (!deviceId) {
      deviceId = Crypto.randomUUID();
      await secureStorage.set(`${BACKUP_SERVICE}.deviceId`, deviceId);
    }
    return deviceId;
  }
}

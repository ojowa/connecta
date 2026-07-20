import * as Crypto from 'expo-crypto';
import { KeyManager } from './KeyManager';
import { MediaEncryptor } from './MediaEncryptor';
import { secureStorage } from '../storage/secureStorage';
import { BackupData } from '../../types/crypto';

const BACKUP_SERVICE = 'com.connecta.backup';

export class SecureBackup {
  async backupKeys(masterPassword: string): Promise<BackupData> {
    const backupKey = await this.deriveBackupKey(masterPassword);

    const identityKeyPair = await KeyManager.getIdentityKeyPair();
    const latestSPK = await KeyManager.getLatestSignedPreKey();

    const keysToBackup: Record<string, any> = {
      identityKeyPair: identityKeyPair || null,
      signedPreKey: latestSPK || null,
      deviceId: await this.getDeviceId(),
    };

    const encryptedBundle = await MediaEncryptor.aesEncrypt(
      JSON.stringify(keysToBackup),
      backupKey,
      backupKey.substring(0, 32),
    );

    const salt = backupKey.substring(0, 32);
    const iterations = 600000;

    const backupData: BackupData = {
      encryptedBundle,
      salt,
      iterations,
      deviceId: keysToBackup.deviceId,
      timestamp: Date.now(),
    };

    await secureStorage.set(`${BACKUP_SERVICE}.last`, JSON.stringify(backupData));

    return backupData;
  }

  async restoreKeys(backupData: BackupData, masterPassword: string): Promise<void> {
    const backupKey = await this.deriveBackupKey(masterPassword, backupData.salt);

    const decrypted = await MediaEncryptor.aesDecrypt(
      backupData.encryptedBundle,
      backupKey,
      backupData.salt,
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
    try {
      const lastBackup = await secureStorage.get(`${BACKUP_SERVICE}.last`);
      if (!lastBackup) return false;

      const backupData: BackupData = JSON.parse(lastBackup);
      const backupKey = await this.deriveBackupKey(masterPassword, backupData.salt);

      const decrypted = await MediaEncryptor.aesDecrypt(
        backupData.encryptedBundle,
        backupKey,
        backupData.salt,
      );

      return !!decrypted;
    } catch {
      return false;
    }
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
    existingSalt?: string,
  ): Promise<string> {
    const salt = existingSalt || (await this.generateSalt());
    const iterations = 600000;

    let derived = password + salt;
    for (let i = 0; i < Math.min(iterations / 1000, 100); i++) {
      derived = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        derived,
      );
    }

    return derived;
  }

  private async generateSalt(): Promise<string> {
    const bytes: number[] = [];
    for (let i = 0; i < 32; i++) {
      bytes.push(Math.floor(Math.random() * 256));
    }
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
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

import * as Crypto from 'expo-crypto';
import { KeyManager } from './KeyManager';
import { MediaEncryptor } from './MediaEncryptor';
import { secureStorage } from '../storage/secureStorage';
import { BackupData } from '../../types/crypto';
import {
  bytesToHex,
  hexToBytes,
  stringToBytes,
  hmacSha256,
  pbkdf2HmacSha256,
  constantTimeEqual,
} from './primitives';
import { STORAGE_KEYS } from '../../constants/storageKeys';

const BACKUP_SERVICE = STORAGE_KEYS.BACKUP_SERVICE;
const BACKUP_ITERATIONS = 600000;

export class SecureBackup {
  async backupKeys(masterPassword: string): Promise<BackupData> {
    const saltBytes = Crypto.getRandomValues(new Uint8Array(32));
    const salt = bytesToHex(saltBytes);
    const backupKey = await this.deriveBackupKey(masterPassword, saltBytes, BACKUP_ITERATIONS);

    const identityKeyPair = await KeyManager.getIdentityKeyPair();
    const latestSPK = await KeyManager.getLatestSignedPreKey();

    const keysToBackup: Record<string, unknown> = {
      identityKeyPair: identityKeyPair || null,
      signedPreKey: latestSPK || null,
      deviceId: await this.getDeviceId(),
    };

    const ivBytes = Crypto.getRandomValues(new Uint8Array(12));
    const iv = bytesToHex(ivBytes);
    const encryptedBundle = await MediaEncryptor.aesEncrypt(
      JSON.stringify(keysToBackup),
      backupKey,
      iv,
    );

    const verificationMac = this.computeVerificationMac(backupKey, encryptedBundle);

    const backupData: BackupData = {
      encryptedBundle,
      verificationMac,
      salt,
      iv,
      iterations: BACKUP_ITERATIONS,
      deviceId: (keysToBackup.deviceId as string) ?? '',
      timestamp: Date.now(),
    };

    await secureStorage.set(`${BACKUP_SERVICE}.last`, JSON.stringify(backupData));

    return backupData;
  }

  async restoreKeys(backupData: BackupData, masterPassword: string): Promise<void> {
    const saltBytes = hexToBytes(backupData.salt);
    const backupKey = await this.deriveBackupKey(masterPassword, saltBytes, backupData.iterations);

    const expectedMac = this.computeVerificationMac(backupKey, backupData.encryptedBundle);
    if (!constantTimeEqual(hexToBytes(expectedMac), hexToBytes(backupData.verificationMac))) {
      throw new Error('Invalid backup password');
    }

    const decrypted = await MediaEncryptor.aesDecrypt(
      backupData.encryptedBundle,
      backupKey,
      backupData.iv,
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
    const saltBytes = hexToBytes(backupData.salt);
    const backupKey = await this.deriveBackupKey(masterPassword, saltBytes, backupData.iterations);

    const expectedMac = this.computeVerificationMac(backupKey, backupData.encryptedBundle);

    return constantTimeEqual(hexToBytes(backupData.verificationMac), hexToBytes(expectedMac));
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

  private computeVerificationMac(backupKeyHex: string, encryptedBundle: string): string {
    const mac = hmacSha256(hexToBytes(backupKeyHex), stringToBytes(encryptedBundle));
    return bytesToHex(mac);
  }

  private async deriveBackupKey(
    password: string,
    salt: Uint8Array,
    iterations: number,
  ): Promise<string> {
    const derived = pbkdf2HmacSha256(stringToBytes(password), salt, iterations, 32);
    return bytesToHex(derived);
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

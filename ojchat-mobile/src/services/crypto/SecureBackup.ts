import * as Crypto from 'expo-crypto';
import { KeyManager } from './KeyManager';
import { MediaEncryptor } from './MediaEncryptor';
import { secureStorage } from '../storage/secureStorage';
import { BackupData } from '../../types/crypto';

const BACKUP_SERVICE = 'com.ojchat.backup';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function xorBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const result = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i];
  }
  return result;
}

function hexStringToBytes(hex: string): Uint8Array {
  return hexToBytes(hex);
}

async function hmacSha256(key: string, data: string): Promise<Uint8Array> {
  const keyBytes = typeof key === 'string' && key.match(/^[0-9a-f]+$/i)
    ? hexToBytes(key)
    : stringToBytes(key);
  const ipad = new Uint8Array(64);
  const opad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    ipad[i] = i < keyBytes.length ? keyBytes[i] ^ 0x36 : 0x36;
    opad[i] = i < keyBytes.length ? keyBytes[i] ^ 0x5c : 0x5c;
  }

  const dataBytes = stringToBytes(data);
  const innerData = new Uint8Array(ipad.length + dataBytes.length);
  innerData.set(ipad);
  innerData.set(dataBytes, ipad.length);
  const innerHex = bytesToHex(innerData);
  const innerHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, innerHex);

  const outerData = new Uint8Array(opad.length + 32);
  outerData.set(opad);
  outerData.set(hexToBytes(innerHash), opad.length);
  const outerHex = bytesToHex(outerData);
  const outerHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, outerHex);
  return hexToBytes(outerHash);
}

async function pbkdf2HmacSha256(
  password: string,
  salt: Uint8Array,
  iterations: number,
  keyLength: number = 32,
): Promise<string> {
  const hLen = 32;
  const l = Math.ceil(keyLength / hLen);
  const dk = new Uint8Array(keyLength);

  for (let i = 1; i <= l; i++) {
    const I = new Uint8Array(salt.length + 4);
    I.set(salt);
    I[salt.length] = (i >> 24) & 0xff;
    I[salt.length + 1] = (i >> 16) & 0xff;
    I[salt.length + 2] = (i >> 8) & 0xff;
    I[salt.length + 3] = i & 0xff;

    let U = await hmacSha256(password, bytesToHex(I));
    let T = new Uint8Array(U);
    for (let j = 1; j < iterations; j++) {
      U = await hmacSha256(password, bytesToHex(U));
      const xored = xorBytes(T, U);
      T = xored;
    }

    const offset = (i - 1) * hLen;
    const toCopy = Math.min(hLen, keyLength - offset);
    dk.set(T.slice(0, toCopy), offset);
  }

  return bytesToHex(dk);
}

export class SecureBackup {
  async backupKeys(masterPassword: string): Promise<BackupData> {
    const saltBytes = Crypto.getRandomValues(new Uint8Array(32));
    const salt = bytesToHex(saltBytes);
    const backupKey = await this.deriveBackupKey(masterPassword, saltBytes);

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
    const saltBytes = hexToBytes(backupData.salt);
    const backupKey = await this.deriveBackupKey(masterPassword, saltBytes);

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
    const saltBytes = hexToBytes(backupData.salt);
    const backupKey = await this.deriveBackupKey(masterPassword, saltBytes);

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
    salt: Uint8Array,
  ): Promise<string> {
    return pbkdf2HmacSha256(password, salt, 600000, 32);
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

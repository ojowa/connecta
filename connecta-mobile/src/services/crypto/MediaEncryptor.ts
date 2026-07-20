import * as Crypto from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import { EncryptedFile } from '../../types/crypto';
import { fileSystem } from '../storage/fileSystem';

export class MediaEncryptor {
  static async encryptFile(fileUri: string): Promise<EncryptedFile> {
    const fileKey = await this.generateKey();
    const iv = await this.generateIV();

    const fileInfo = await fileSystem.getFileInfo(fileUri);
    if (!fileInfo || !fileInfo.exists) {
      throw new Error('File not found');
    }

    const base64Data = await this.readFileAsBase64(fileUri);

    const encrypted = await this.aesEncrypt(base64Data, fileKey, iv);

    const cacheDir = await fileSystem.ensureCacheDir();
    const encryptedUri = `${cacheDir}encrypted_${Date.now()}.enc`;
    const encFile = new File(encryptedUri);
    encFile.write(encrypted);

    const mac = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      fileKey + encrypted + iv,
    );

    return {
      uri: encryptedUri,
      key: fileKey,
      iv,
      mac,
      mimeType: 'application/octet-stream',
      size: fileInfo.size || 0,
    };
  }

  static async decryptFile(
    encryptedUri: string,
    key: string,
    iv: string,
    expectedMac: string,
  ): Promise<string> {
    const fileInfo = await fileSystem.getFileInfo(encryptedUri);
    if (!fileInfo || !fileInfo.exists) {
      throw new Error('Encrypted file not found');
    }

    const encryptedData = await this.readFileAsBase64(encryptedUri);

    const mac = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      key + encryptedData + iv,
    );

    if (mac !== expectedMac) {
      throw new Error('File integrity check failed');
    }

    const decrypted = await this.aesDecrypt(encryptedData, key, iv);

    const cacheDir = await fileSystem.ensureCacheDir();
    const decryptedUri = `${cacheDir}decrypted_${Date.now()}`;
    const decFile = new File(decryptedUri);
    decFile.write(decrypted);

    return decryptedUri;
  }

  static async encryptData(data: string): Promise<{ cipherText: string; key: string; iv: string }> {
    const key = await this.generateKey();
    const iv = await this.generateIV();
    const cipherText = await this.aesEncrypt(data, key, iv);
    return { cipherText, key, iv };
  }

  static async decryptData(cipherText: string, key: string, iv: string): Promise<string> {
    return this.aesDecrypt(cipherText, key, iv);
  }

  static async generateKey(): Promise<string> {
    const bytes: number[] = [];
    for (let i = 0; i < 32; i++) {
      bytes.push(Math.floor(Math.random() * 256));
    }
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  static async generateIV(): Promise<string> {
    const bytes: number[] = [];
    for (let i = 0; i < 16; i++) {
      bytes.push(Math.floor(Math.random() * 256));
    }
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  static hexToBytes(hex: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substring(i, i + 2), 16));
    }
    return bytes;
  }

  static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static async aesEncrypt(data: string, key: string, iv: string): Promise<string> {
    const dataBytes = new TextEncoder().encode(data);
    const keyBytes = this.hexToBytes(key);
    const ivBytes = this.hexToBytes(iv);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(keyBytes),
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt'],
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: new Uint8Array(ivBytes), tagLength: 128 },
      cryptoKey,
      dataBytes,
    );

    return this.bytesToHex(new Uint8Array(encrypted));
  }

  static async aesDecrypt(cipherText: string, key: string, iv: string): Promise<string> {
    const cipherBytes = this.hexToBytes(cipherText);
    const keyBytes = this.hexToBytes(key);
    const ivBytes = this.hexToBytes(iv);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(keyBytes),
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(ivBytes), tagLength: 128 },
      cryptoKey,
      new Uint8Array(cipherBytes),
    );

    return new TextDecoder().decode(decrypted);
  }

  private static async readFileAsBase64(uri: string): Promise<string> {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1] || result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

import * as Crypto from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import { EncryptedFile } from '../../types/crypto';
import { fileSystem } from '../storage/fileSystem';
import { KeyManager } from './KeyManager';

export class MediaEncryptor {
  static async encryptFile(fileUri: string): Promise<EncryptedFile> {
    const fileKey = await KeyManager.generateRandomBytes(32);
    const iv = await KeyManager.generateRandomBytes(16);

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
      'connecta-file-mac:' + fileKey + ':' + encrypted + ':' + iv,
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
      'connecta-file-mac:' + key + ':' + encryptedData + ':' + iv,
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
    const key = await KeyManager.generateRandomBytes(32);
    const iv = await KeyManager.generateRandomBytes(16);
    const cipherText = await this.aesEncrypt(data, key, iv);
    return { cipherText, key, iv };
  }

  static async decryptData(cipherText: string, key: string, iv: string): Promise<string> {
    return this.aesDecrypt(cipherText, key, iv);
  }

  static async aesEncrypt(data: string, key: string, iv: string): Promise<string> {
    const dataBytes = new TextEncoder().encode(data);
    const keyBytes = KeyManager.hexToBytes(key);
    const ivBytes = KeyManager.hexToBytes(iv);

    const keyStream = await this.generateKeyStream(keyBytes, ivBytes, dataBytes.length);
    const encrypted = new Uint8Array(dataBytes.length);
    for (let i = 0; i < dataBytes.length; i++) {
      encrypted[i] = dataBytes[i] ^ keyStream[i];
    }

    const tag = await this.computeTag(keyBytes, ivBytes, encrypted);
    const result = new Uint8Array(encrypted.length + 16);
    result.set(encrypted);
    result.set(tag, encrypted.length);

    return KeyManager.bytesToHex(result);
  }

  static async aesDecrypt(cipherText: string, key: string, iv: string): Promise<string> {
    const allBytes = KeyManager.hexToBytes(cipherText);
    const keyBytes = KeyManager.hexToBytes(key);
    const ivBytes = KeyManager.hexToBytes(iv);

    if (allBytes.length < 16) {
      throw new Error('Ciphertext too short');
    }

    const encrypted = new Uint8Array(allBytes.slice(0, allBytes.length - 16));
    const receivedTag = new Uint8Array(allBytes.slice(allBytes.length - 16));

    const expectedTag = await this.computeTag(keyBytes, ivBytes, encrypted);
    if (!this.constantTimeCompare(receivedTag, expectedTag)) {
      throw new Error('Authentication tag verification failed');
    }

    const keyStream = await this.generateKeyStream(keyBytes, ivBytes, encrypted.length);
    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ keyStream[i];
    }

    return new TextDecoder().decode(decrypted);
  }

  private static async generateKeyStream(
    key: Uint8Array,
    iv: Uint8Array,
    length: number,
  ): Promise<Uint8Array> {
    const stream = new Uint8Array(length);
    const blocksNeeded = Math.ceil(length / 32);

    for (let block = 0; block < blocksNeeded; block++) {
      const counter = new Uint8Array(16);
      counter.set(iv.slice(0, 12));
      counter[12] = (block >> 24) & 0xff;
      counter[13] = (block >> 16) & 0xff;
      counter[14] = (block >> 8) & 0xff;
      counter[15] = block & 0xff;

      const hashInput = KeyManager.bytesToHex(new Uint8Array([...key, ...counter]));
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        hashInput,
      );

      const hashBytes = KeyManager.hexToBytes(hash);
      const offset = block * 32;
      const toCopy = Math.min(32, length - offset);
      for (let i = 0; i < toCopy; i++) {
        stream[offset + i] = hashBytes[i];
      }
    }

    return stream;
  }

  private static async computeTag(
    key: Uint8Array,
    iv: Uint8Array,
    ciphertext: Uint8Array,
  ): Promise<Uint8Array> {
    const tagInput = 'connecta-file-mac:' + KeyManager.bytesToHex(key) + ':' + KeyManager.bytesToHex(iv) + ':' + KeyManager.bytesToHex(ciphertext);
    const tagHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      tagInput,
    );
    return new Uint8Array(KeyManager.hexToBytes(tagHash).slice(0, 16));
  }

  private static constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
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

import * as Crypto from 'expo-crypto';
import { AESEncryptionKey, AESSealedData, aesEncryptAsync, aesDecryptAsync, AESKeySize } from 'expo-crypto';
import { File } from 'expo-file-system';
import { EncryptedFile } from '../../types/crypto';
import { fileSystem } from '../storage/fileSystem';

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export class MediaEncryptor {
  static async encryptFile(fileUri: string): Promise<EncryptedFile> {
    const keyBytes = Crypto.getRandomValues(new Uint8Array(32));
    const fileKey = bytesToHex(keyBytes);
    const ivBytes = Crypto.getRandomValues(new Uint8Array(12));

    const fileInfo = await fileSystem.getFileInfo(fileUri);
    if (!fileInfo || !fileInfo.exists) {
      throw new Error('File not found');
    }

    const base64Data = await this.readFileAsBase64(fileUri);

    const key = await AESEncryptionKey.fromHex(fileKey);
    const plaintextBytes = hexToBytes(
      Array.from(new TextEncoder().encode(base64Data))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    );

    const sealed = await aesEncryptAsync(plaintextBytes, key, {
      nonce: { bytes: ivBytes },
    });

    const ciphertext = bytesToHex(new Uint8Array(await sealed.ciphertext()));
    const tag = bytesToHex(new Uint8Array(await sealed.tag()));
    const combined = ciphertext + tag;

    const cacheDir = await fileSystem.ensureCacheDir();
    const encryptedUri = `${cacheDir}encrypted_${Date.now()}.enc`;
    const encFile = new File(encryptedUri);
    encFile.write(combined);

    const iv = bytesToHex(ivBytes);

    return {
      uri: encryptedUri,
      key: fileKey,
      iv,
      mac: tag,
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

    const aesKey = await AESEncryptionKey.fromHex(key);
    const ivBytes = hexToBytes(iv);
    const ciphertextBytes = hexToBytes(encryptedData);
    const tagBytes = hexToBytes(expectedMac);

    const sealed = AESSealedData.fromParts(ivBytes, ciphertextBytes, tagBytes);
    const decrypted = await aesDecryptAsync(sealed, aesKey, { output: 'bytes' });

    const cacheDir = await fileSystem.ensureCacheDir();
    const decryptedUri = `${cacheDir}decrypted_${Date.now()}`;
    const decFile = new File(decryptedUri);
    decFile.write(new TextDecoder().decode(new Uint8Array(decrypted)));

    return decryptedUri;
  }

  static async encryptData(data: string): Promise<{ cipherText: string; key: string; iv: string }> {
    const keyBytes = Crypto.getRandomValues(new Uint8Array(32));
    const key = bytesToHex(keyBytes);
    const ivBytes = Crypto.getRandomValues(new Uint8Array(12));
    const iv = bytesToHex(ivBytes);

    const aesKey = await AESEncryptionKey.fromHex(key);
    const plaintextBytes = new TextEncoder().encode(data);

    const sealed = await aesEncryptAsync(plaintextBytes, aesKey, {
      nonce: { bytes: ivBytes },
    });

    const ciphertext = bytesToHex(new Uint8Array(await sealed.ciphertext()));
    const tag = bytesToHex(new Uint8Array(await sealed.tag()));
    const cipherText = ciphertext + tag;

    return { cipherText, key, iv };
  }

  static async decryptData(cipherText: string, key: string, iv: string): Promise<string> {
    const aesKey = await AESEncryptionKey.fromHex(key);
    const ivBytes = hexToBytes(iv);
    const allBytes = hexToBytes(cipherText);
    const tagBytes = allBytes.slice(allBytes.length - 16);
    const ciphertextBytes = allBytes.slice(0, allBytes.length - 16);

    const sealed = AESSealedData.fromParts(ivBytes, ciphertextBytes, tagBytes);
    const decrypted = await aesDecryptAsync(sealed, aesKey, { output: 'bytes' });
    return new TextDecoder().decode(new Uint8Array(decrypted));
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

import * as Crypto from 'expo-crypto';
import { AESEncryptionKey, AESSealedData, aesEncryptAsync, aesDecryptAsync } from 'expo-crypto';
import { File } from 'expo-file-system';
import { EncryptedFile } from '../../types/crypto';
import { fileSystem } from '../storage/fileSystem';
import { bytesToHex, hexToBytes, concatBytes } from './primitives';

const GCM_TAG_LENGTH = 16;

export class MediaEncryptor {
  static async encryptFile(fileUri: string): Promise<EncryptedFile> {
    const keyBytes = Crypto.getRandomValues(new Uint8Array(32));
    const fileKey = bytesToHex(keyBytes);
    const ivBytes = Crypto.getRandomValues(new Uint8Array(12));

    const fileInfo = await fileSystem.getFileInfo(fileUri);
    if (!fileInfo || !fileInfo.exists) {
      throw new Error('File not found');
    }

    const sourceFile = new File(fileUri);
    const plaintextBytes = await sourceFile.bytes();

    const key = await AESEncryptionKey.import(fileKey, 'hex');
    const sealed = await aesEncryptAsync(plaintextBytes, key, {
      nonce: { bytes: ivBytes },
    });

    const ciphertext = new Uint8Array(await sealed.ciphertext());
    const tag = new Uint8Array(await sealed.tag());
    const combined = concatBytes(ciphertext, tag);

    const cacheDir = await fileSystem.ensureCacheDir();
    const encryptedUri = `${cacheDir}encrypted_${Date.now()}.enc`;
    const encFile = new File(encryptedUri);
    encFile.write(combined);

    return {
      uri: encryptedUri,
      key: fileKey,
      iv: bytesToHex(ivBytes),
      mac: bytesToHex(tag),
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

    const encFile = new File(encryptedUri);
    const allBytes = await encFile.bytes();
    if (allBytes.length < GCM_TAG_LENGTH) {
      throw new Error('Encrypted file is too short');
    }

    const aesKey = await AESEncryptionKey.import(key, 'hex');
    const ivBytes = hexToBytes(iv);
    const ciphertextBytes = allBytes.slice(0, allBytes.length - GCM_TAG_LENGTH);
    const tagBytes = allBytes.slice(allBytes.length - GCM_TAG_LENGTH);

    if (bytesToHex(tagBytes) !== expectedMac) {
      throw new Error('Authentication tag mismatch');
    }

    const sealed = AESSealedData.fromParts(ivBytes, ciphertextBytes, tagBytes);
    const decrypted = await aesDecryptAsync(sealed, aesKey, { output: 'bytes' });

    const cacheDir = await fileSystem.ensureCacheDir();
    const decryptedUri = `${cacheDir}decrypted_${Date.now()}`;
    const decFile = new File(decryptedUri);
    decFile.write(new Uint8Array(decrypted));

    return decryptedUri;
  }

  static async aesEncrypt(plaintext: string, keyHex: string, ivHex: string): Promise<string> {
    const aesKey = await AESEncryptionKey.import(keyHex, 'hex');
    const ivBytes = hexToBytes(ivHex);
    const plaintextBytes = new TextEncoder().encode(plaintext);

    const sealed = await aesEncryptAsync(plaintextBytes, aesKey, {
      nonce: { bytes: ivBytes },
    });

    const ciphertext = bytesToHex(new Uint8Array(await sealed.ciphertext()));
    const tag = bytesToHex(new Uint8Array(await sealed.tag()));
    return ciphertext + tag;
  }

  static async aesDecrypt(cipherTextHex: string, keyHex: string, ivHex: string): Promise<string> {
    const aesKey = await AESEncryptionKey.import(keyHex, 'hex');
    const ivBytes = hexToBytes(ivHex);
    const allBytes = hexToBytes(cipherTextHex);
    if (allBytes.length < GCM_TAG_LENGTH) {
      throw new Error('Ciphertext is too short');
    }
    const ciphertextBytes = allBytes.slice(0, allBytes.length - GCM_TAG_LENGTH);
    const tagBytes = allBytes.slice(allBytes.length - GCM_TAG_LENGTH);

    const sealed = AESSealedData.fromParts(ivBytes, ciphertextBytes, tagBytes);
    const decrypted = await aesDecryptAsync(sealed, aesKey, { output: 'bytes' });
    return new TextDecoder().decode(new Uint8Array(decrypted));
  }

  static async encryptData(data: string): Promise<{ cipherText: string; key: string; iv: string }> {
    const keyBytes = Crypto.getRandomValues(new Uint8Array(32));
    const key = bytesToHex(keyBytes);
    const ivBytes = Crypto.getRandomValues(new Uint8Array(12));
    const iv = bytesToHex(ivBytes);

    const aesKey = await AESEncryptionKey.import(key, 'hex');
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
    const aesKey = await AESEncryptionKey.import(key, 'hex');
    const ivBytes = hexToBytes(iv);
    const allBytes = hexToBytes(cipherText);
    if (allBytes.length < GCM_TAG_LENGTH) {
      throw new Error('Ciphertext is too short');
    }
    const ciphertextBytes = allBytes.slice(0, allBytes.length - GCM_TAG_LENGTH);
    const tagBytes = allBytes.slice(allBytes.length - GCM_TAG_LENGTH);

    const sealed = AESSealedData.fromParts(ivBytes, ciphertextBytes, tagBytes);
    const decrypted = await aesDecryptAsync(sealed, aesKey, { output: 'bytes' });
    return new TextDecoder().decode(new Uint8Array(decrypted));
  }
}

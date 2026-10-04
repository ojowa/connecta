import * as Crypto from 'expo-crypto';
import { AESEncryptionKey, AESSealedData, aesEncryptAsync, aesDecryptAsync } from 'expo-crypto';
import { generateKeyPair, scalarMultBase, sharedKey } from '@stablelib/x25519';
import { getDatabase } from '../../database/connection';
import { secureStorage } from '../storage/secureStorage';
import {
  KeyPair,
  IdentityKeyPair,
  SigningKeyPair,
  SignedPreKey,
  OneTimePreKey,
} from '../../types/crypto';
import {
  bytesToHex,
  hexToBytes,
  stringToBytes,
  ed25519GenerateKeyPair,
  ed25519Sign,
  ed25519Verify,
} from './primitives';
import { STORAGE_KEYS } from '../../constants/storageKeys';

const KEY_SERVICE = STORAGE_KEYS.CRYPTO_SERVICE;
const DB_KEY_NAME = STORAGE_KEYS.DB_KEY;
const SIGNING_KEY_NAME = STORAGE_KEYS.SIGNING_KEY;
const SPK_SIGNATURE_CONTEXT = STORAGE_KEYS.SPK_LABEL;

let dbEncryptionKey: string | null = null;

async function getDbEncryptionKey(): Promise<string> {
  if (dbEncryptionKey) return dbEncryptionKey;
  const existing = await secureStorage.get(DB_KEY_NAME);
  if (existing) {
    dbEncryptionKey = existing;
    return existing;
  }
  const keyBytes = Crypto.getRandomValues(new Uint8Array(32));
  const key = bytesToHex(keyBytes);
  await secureStorage.set(DB_KEY_NAME, key);
  dbEncryptionKey = key;
  return key;
}

async function encryptForDb(plaintext: string): Promise<string> {
  const key = await getDbEncryptionKey();
  const aesKey = await AESEncryptionKey.import(key, 'hex');
  const ivBytes = Crypto.getRandomValues(new Uint8Array(12));
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const sealed = await aesEncryptAsync(plaintextBytes, aesKey, {
    nonce: { bytes: ivBytes },
  });
  const ciphertext = bytesToHex(new Uint8Array(await sealed.ciphertext()));
  const tag = bytesToHex(new Uint8Array(await sealed.tag()));
  const iv = bytesToHex(ivBytes);
  return `${iv}:${ciphertext}:${tag}`;
}

async function decryptFromDb(encrypted: string): Promise<string> {
  const key = await getDbEncryptionKey();
  const parts = encrypted.split(':');
  if (parts.length !== 3) return encrypted;
  const [iv, ciphertext, tag] = parts;
  const aesKey = await AESEncryptionKey.import(key, 'hex');
  const ivBytes = hexToBytes(iv);
  const ciphertextBytes = hexToBytes(ciphertext);
  const tagBytes = hexToBytes(tag);
  const sealed = AESSealedData.fromParts(ivBytes, ciphertextBytes, tagBytes);
  const decrypted = await aesDecryptAsync(sealed, aesKey, { output: 'bytes' });
  return new TextDecoder().decode(new Uint8Array(decrypted));
}

function signedPreKeySignaturePayload(spkPublicKey: string, keyId: number): Uint8Array {
  return stringToBytes(`${SPK_SIGNATURE_CONTEXT}:${spkPublicKey}:${keyId}`);
}

export class KeyManager {
  static hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static async generateRandomBytes(length: number): Promise<string> {
    const array = new Uint8Array(length);
    Crypto.getRandomValues(array);
    return this.bytesToHex(array);
  }

  static generateKeyPairSync(): KeyPair {
    const keyPair = generateKeyPair();
    return {
      privateKey: this.bytesToHex(keyPair.secretKey),
      publicKey: this.bytesToHex(keyPair.publicKey),
    };
  }

  static async generateKeyPair(): Promise<KeyPair> {
    return this.generateKeyPairSync();
  }

  static async derivePublicKey(privateKey: string): Promise<string> {
    const privateKeyBytes = this.hexToBytes(privateKey);
    const publicKeyBytes = scalarMultBase(privateKeyBytes);
    return this.bytesToHex(publicKeyBytes);
  }

  static async computeDH(privateKeyHex: string, publicKeyHex: string): Promise<string> {
    const privateKeyBytes = this.hexToBytes(privateKeyHex);
    const publicKeyBytes = this.hexToBytes(publicKeyHex);
    const shared = sharedKey(privateKeyBytes, publicKeyBytes, true);
    return this.bytesToHex(shared);
  }

  static async generateIdentityKeyPair(): Promise<IdentityKeyPair> {
    const keyPair = await this.generateKeyPair();
    const keyId = Crypto.randomUUID();
    return { ...keyPair, keyId };
  }

  static generateSigningKeyPair(): SigningKeyPair {
    const keyPair = ed25519GenerateKeyPair();
    return {
      privateKey: this.bytesToHex(keyPair.secretKey),
      publicKey: this.bytesToHex(keyPair.publicKey),
      keyId: Crypto.randomUUID(),
    };
  }

  static async storeSigningKeyPair(signingKeyPair: SigningKeyPair): Promise<void> {
    await secureStorage.set(SIGNING_KEY_NAME, JSON.stringify(signingKeyPair));
  }

  static async getSigningKeyPair(): Promise<SigningKeyPair | null> {
    const data = await secureStorage.get(SIGNING_KEY_NAME);
    if (!data) return null;
    return JSON.parse(data);
  }

  static async getOrCreateSigningKeyPair(): Promise<SigningKeyPair> {
    const existing = await this.getSigningKeyPair();
    if (existing) return existing;
    const keyPair = this.generateSigningKeyPair();
    await this.storeSigningKeyPair(keyPair);
    return keyPair;
  }

  static async generateSignedPreKey(
    signingPrivateKey: string,
    keyId: number,
  ): Promise<SignedPreKey> {
    const keyPair = await this.generateKeyPair();
    const payload = signedPreKeySignaturePayload(keyPair.publicKey, keyId);
    const signature = ed25519Sign(hexToBytes(signingPrivateKey), payload);
    return {
      ...keyPair,
      keyId,
      signature: this.bytesToHex(signature),
      createdAt: Date.now(),
    };
  }

  static verifySignedPreKeySignature(
    signingPublicKey: string,
    spkPublicKey: string,
    keyId: number,
    signatureHex: string,
  ): boolean {
    const payload = signedPreKeySignaturePayload(spkPublicKey, keyId);
    return ed25519Verify(hexToBytes(signingPublicKey), payload, hexToBytes(signatureHex));
  }

  static async generateOneTimePreKeys(startId: number, count: number): Promise<OneTimePreKey[]> {
    const keys: OneTimePreKey[] = [];
    for (let i = 0; i < count; i++) {
      const keyPair = await this.generateKeyPair();
      keys.push({
        ...keyPair,
        keyId: startId + i,
        used: false,
        createdAt: Date.now(),
      });
    }
    return keys;
  }

  static async storeIdentityKeyPair(identityKeyPair: IdentityKeyPair): Promise<void> {
    await secureStorage.set(`${KEY_SERVICE}.identity`, JSON.stringify(identityKeyPair));
  }

  static async getIdentityKeyPair(): Promise<IdentityKeyPair | null> {
    const data = await secureStorage.get(`${KEY_SERVICE}.identity`);
    if (!data) return null;
    return JSON.parse(data);
  }

  static async storeSignedPreKey(signedPreKey: SignedPreKey): Promise<void> {
    const db = await getDatabase();
    const encrypted = await encryptForDb(JSON.stringify(signedPreKey));
    await db.runAsync(
      `INSERT OR REPLACE INTO local_encryption_keys (id, key_type, key_data, created_at, rotated_at, expires_at)
       VALUES (?, 'signed_pre_key', ?, datetime('now'), datetime('now'), datetime('now', '+7 days'))`,
      [String(signedPreKey.keyId), encrypted],
    );
  }

  static async getSignedPreKey(keyId: number): Promise<SignedPreKey | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ key_data: string }>(
      'SELECT key_data FROM local_encryption_keys WHERE id = ? AND key_type = ?',
      [String(keyId), 'signed_pre_key'],
    );
    if (!row) return null;
    const decrypted = await decryptFromDb(row.key_data);
    return JSON.parse(decrypted);
  }

  static async getLatestSignedPreKey(): Promise<SignedPreKey | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ key_data: string }>(
      `SELECT key_data FROM local_encryption_keys
       WHERE key_type = 'signed_pre_key'
       ORDER BY created_at DESC LIMIT 1`,
    );
    if (!row) return null;
    const decrypted = await decryptFromDb(row.key_data);
    return JSON.parse(decrypted);
  }

  static async storeOneTimePreKeys(keys: OneTimePreKey[]): Promise<void> {
    const db = await getDatabase();
    for (const key of keys) {
      const encrypted = await encryptForDb(JSON.stringify(key));
      await db.runAsync(
        `INSERT OR REPLACE INTO local_encryption_keys (id, key_type, key_data, created_at)
         VALUES (?, 'one_time_pre_key', ?, datetime('now'))`,
        [String(key.keyId), encrypted],
      );
    }
  }

  static async getOneTimePreKey(keyId: number): Promise<OneTimePreKey | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ key_data: string }>(
      'SELECT key_data FROM local_encryption_keys WHERE id = ? AND key_type = ?',
      [String(keyId), 'one_time_pre_key'],
    );
    if (!row) return null;
    const decrypted = await decryptFromDb(row.key_data);
    return JSON.parse(decrypted);
  }

  static async getUnusedOneTimePreKeys(): Promise<OneTimePreKey[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ key_data: string }>(
      `SELECT key_data FROM local_encryption_keys
       WHERE key_type = 'one_time_pre_key'
       ORDER BY created_at ASC`,
    );
    const results: OneTimePreKey[] = [];
    for (const row of rows) {
      const decrypted = await decryptFromDb(row.key_data);
      const key = JSON.parse(decrypted) as OneTimePreKey;
      if (!key.used) results.push(key);
    }
    return results;
  }

  static async getOneTimePreKeyCount(): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM local_encryption_keys
       WHERE key_type = 'one_time_pre_key'`,
    );
    return row?.count || 0;
  }

  static async markOneTimePreKeyUsed(keyId: number): Promise<void> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ key_data: string }>(
      'SELECT key_data FROM local_encryption_keys WHERE id = ?',
      [String(keyId)],
    );
    if (row) {
      const decrypted = await decryptFromDb(row.key_data);
      const keyData = JSON.parse(decrypted);
      keyData.used = true;
      const encrypted = await encryptForDb(JSON.stringify(keyData));
      await db.runAsync('UPDATE local_encryption_keys SET key_data = ? WHERE id = ?', [
        encrypted,
        String(keyId),
      ]);
    }
  }

  static async storeSessionKey(sessionId: string, key: string): Promise<void> {
    await secureStorage.set(`${KEY_SERVICE}.session.${sessionId}`, key);
  }

  static async getSessionKey(sessionId: string): Promise<string | null> {
    return secureStorage.get(`${KEY_SERVICE}.session.${sessionId}`);
  }

  static async deleteSessionKey(sessionId: string): Promise<void> {
    await secureStorage.remove(`${KEY_SERVICE}.session.${sessionId}`);
  }

  static async storeRatchetState(sessionId: string, state: any): Promise<void> {
    await secureStorage.set(`${KEY_SERVICE}.ratchet.${sessionId}`, JSON.stringify(state));
  }

  static async getRatchetState(sessionId: string): Promise<any | null> {
    const data = await secureStorage.get(`${KEY_SERVICE}.ratchet.${sessionId}`);
    if (!data) return null;
    return JSON.parse(data);
  }

  static async deleteRatchetState(sessionId: string): Promise<void> {
    await secureStorage.remove(`${KEY_SERVICE}.ratchet.${sessionId}`);
  }

  static async deleteAllKeys(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM local_encryption_keys');
  }
}

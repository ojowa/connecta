import * as Crypto from 'expo-crypto';
import { generateKeyPair, scalarMultBase, sharedKey } from '@stablelib/x25519';
import { getDatabase } from '../../database/connection';
import { secureStorage } from '../storage/secureStorage';
import { KeyPair, IdentityKeyPair, SignedPreKey, OneTimePreKey } from '../../types/crypto';

const KEY_SERVICE = 'com.ojchat.crypto';

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

  static async generateSignedPreKey(
    identityPrivateKey: string,
    keyId: number,
  ): Promise<SignedPreKey> {
    const keyPair = await this.generateKeyPair();
    const signaturePayload = `ojchat-spk:${keyPair.publicKey}:${keyId}`;
    const signature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      signaturePayload + ':' + identityPrivateKey,
    );
    return {
      ...keyPair,
      keyId,
      signature,
      createdAt: Date.now(),
    };
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
    await db.runAsync(
      `INSERT OR REPLACE INTO local_encryption_keys (id, key_type, key_data, created_at, rotated_at, expires_at)
       VALUES (?, 'signed_pre_key', ?, datetime('now'), datetime('now'), datetime('now', '+7 days'))`,
      [String(signedPreKey.keyId), JSON.stringify(signedPreKey)],
    );
  }

  static async getSignedPreKey(keyId: number): Promise<SignedPreKey | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ key_data: string }>(
      'SELECT key_data FROM local_encryption_keys WHERE id = ? AND key_type = ?',
      [String(keyId), 'signed_pre_key'],
    );
    if (!row) return null;
    return JSON.parse(row.key_data);
  }

  static async getLatestSignedPreKey(): Promise<SignedPreKey | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ key_data: string }>(
      `SELECT key_data FROM local_encryption_keys
       WHERE key_type = 'signed_pre_key'
       ORDER BY created_at DESC LIMIT 1`,
    );
    if (!row) return null;
    return JSON.parse(row.key_data);
  }

  static async storeOneTimePreKeys(keys: OneTimePreKey[]): Promise<void> {
    const db = await getDatabase();
    for (const key of keys) {
      await db.runAsync(
        `INSERT OR REPLACE INTO local_encryption_keys (id, key_type, key_data, created_at)
         VALUES (?, 'one_time_pre_key', ?, datetime('now'))`,
        [String(key.keyId), JSON.stringify(key)],
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
    return JSON.parse(row.key_data);
  }

  static async getUnusedOneTimePreKeys(): Promise<OneTimePreKey[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ key_data: string }>(
      `SELECT key_data FROM local_encryption_keys
       WHERE key_type = 'one_time_pre_key'
       ORDER BY created_at ASC`,
    );
    return rows
      .map((row) => JSON.parse(row.key_data) as OneTimePreKey)
      .filter((key) => !key.used);
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
      const keyData = JSON.parse(row.key_data);
      keyData.used = true;
      await db.runAsync(
        'UPDATE local_encryption_keys SET key_data = ? WHERE id = ?',
        [JSON.stringify(keyData), String(keyId)],
      );
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

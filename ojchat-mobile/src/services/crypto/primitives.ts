import * as ed from '@stablelib/ed25519';
import { HKDF } from '@stablelib/hkdf';
import { HMAC, hmac } from '@stablelib/hmac';
import { SHA256, hash as sha256Hash } from '@stablelib/sha256';

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const normalized = hex.length % 2 === 0 ? hex : `0${hex}`;
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = parseInt(normalized.substring(i, i + 2), 16);
  }
  return bytes;
}

export function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

export function sha256(data: Uint8Array): Uint8Array {
  return sha256Hash(data);
}

export function hmacSha256(key: Uint8Array, data: Uint8Array): Uint8Array {
  return hmac(SHA256, key, data);
}

export function hkdfSha256(
  ikm: Uint8Array,
  salt: Uint8Array,
  info: Uint8Array,
  length: number,
): Uint8Array {
  const kdf = new HKDF(SHA256, ikm, salt, info);
  const okm = kdf.expand(length);
  kdf.clean();
  return okm;
}

export function pbkdf2HmacSha256(
  password: Uint8Array,
  salt: Uint8Array,
  iterations: number,
  keyLength: number,
): Uint8Array {
  if (iterations < 1) throw new Error('PBKDF2 iterations must be >= 1');
  const hLen = 32;
  const blocks = Math.ceil(keyLength / hLen);
  const dk = new Uint8Array(keyLength);

  for (let i = 1; i <= blocks; i++) {
    const block = new Uint8Array(salt.length + 4);
    block.set(salt);
    block[salt.length] = (i >>> 24) & 0xff;
    block[salt.length + 1] = (i >>> 16) & 0xff;
    block[salt.length + 2] = (i >>> 8) & 0xff;
    block[salt.length + 3] = i & 0xff;

    let u = hmacSha256(password, block);
    const t = new Uint8Array(u);
    for (let j = 1; j < iterations; j++) {
      u = hmacSha256(password, u);
      for (let k = 0; k < t.length; k++) {
        t[k] ^= u[k];
      }
    }

    const offset = (i - 1) * hLen;
    dk.set(t.subarray(0, Math.min(hLen, keyLength - offset)), offset);
  }

  return dk;
}

export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

export function ed25519GenerateKeyPair(): ed.KeyPair {
  return ed.generateKeyPair();
}

export function ed25519Sign(secretKey: Uint8Array, message: Uint8Array): Uint8Array {
  return ed.sign(secretKey, message);
}

export function ed25519Verify(
  publicKey: Uint8Array,
  message: Uint8Array,
  signature: Uint8Array,
): boolean {
  try {
    return ed.verify(publicKey, message, signature);
  } catch {
    return false;
  }
}

export function ed25519PublicKeyToX25519(publicKey: Uint8Array): Uint8Array {
  return ed.convertPublicKeyToX25519(publicKey);
}

export { HMAC };

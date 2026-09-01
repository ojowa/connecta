import * as crypto from 'node:crypto';
import {
  bytesToHex,
  hexToBytes,
  stringToBytes,
  concatBytes,
  hmacSha256,
  hkdfSha256,
  pbkdf2HmacSha256,
  sha256,
  ed25519GenerateKeyPair,
  ed25519Sign,
  ed25519Verify,
} from '../../src/services/crypto/primitives';

describe('bytesToHex / hexToBytes', () => {
  test('round-trips random bytes', () => {
    const input = new Uint8Array([0, 1, 2, 15, 16, 127, 128, 200, 255]);
    const hex = bytesToHex(input);
    expect(hexToBytes(hex)).toEqual(input);
  });

  test('padded hex keeps single-digit bytes (no data loss on odd nibbles)', () => {
    expect(bytesToHex(new Uint8Array([0x01, 0x0f, 0x10]))).toBe('010f10');
    expect(hexToBytes('010f10')).toEqual(new Uint8Array([0x01, 0x0f, 0x10]));
  });
});

describe('HMAC-SHA256', () => {
  const vectors = [
    { key: 'Jefe', data: 'what do ya want for nothing?' },
    { key: new Array(32).fill(0x0b), data: 'Hi There' },
    { key: 'this is the key', data: 'the quick brown fox jumps over the lazy dog' },
  ];

  test.each(vectors)('matches Node createHmac', ({ key, data }) => {
    const keyBytes = Uint8Array.from(typeof key === 'string' ? new TextEncoder().encode(key) : key);
    const dataBytes = stringToBytes(typeof data === 'string' ? data : data.join(''));
    const mine = hmacSha256(keyBytes, dataBytes);
    const ref = crypto
      .createHmac('sha256', Buffer.from(keyBytes))
      .update(Buffer.from(dataBytes))
      .digest();
    expect(Buffer.from(bytesToHex(mine), 'hex')).toEqual(ref);
  });

  test('key longer than the block size is hashed down first (still matches Node)', () => {
    const key = crypto.randomBytes(128);
    const data = 'test data';
    const mine = hmacSha256(new Uint8Array(key), stringToBytes(data));
    const ref = crypto.createHmac('sha256', key).update(data).digest();
    expect(Buffer.from(bytesToHex(mine), 'hex')).toEqual(ref);
  });
});

describe('sha256', () => {
  test('matches Node createHash', () => {
    const data = stringToBytes('hello world');
    const mine = sha256(data);
    const ref = crypto.createHash('sha256').update('hello world').digest();
    expect(Buffer.from(bytesToHex(mine), 'hex')).toEqual(ref);
  });
  test('empty input matches Node', () => {
    expect(Buffer.from(bytesToHex(sha256(new Uint8Array())), 'hex')).toEqual(
      crypto.createHash('sha256').update('').digest(),
    );
  });
});

describe('HKDF-SHA256', () => {
  test('matches Node crypto.hkdfSync', () => {
    const ikm = crypto.randomBytes(32);
    const salt = crypto.randomBytes(16);
    const info = new Uint8Array([1, 2, 3, 4, 5]);
    const mine = hkdfSha256(new Uint8Array(ikm), new Uint8Array(salt), info, 32);
    const ref = crypto.hkdfSync('sha256', Buffer.from(ikm), Buffer.from(salt), Buffer.from(info), 32);
    expect(Buffer.from(bytesToHex(mine), 'hex')).toEqual(ref);
  });
});

describe('PBKDF2-HMAC-SHA256', () => {
  test('matches Node crypto.pbkdf2Sync', () => {
    const password = 'a strong password';
    const salt = crypto.randomBytes(8);
    const iterations = 1200;
    const dkLen = 32;

    const mine = pbkdf2HmacSha256(stringToBytes(password), new Uint8Array(salt), iterations, dkLen);
    const ref = crypto.pbkdf2Sync(password, salt, iterations, dkLen, 'sha256');
    expect(Buffer.from(bytesToHex(mine), 'hex')).toEqual(ref);
  });

  test('output length and per-password divergence', () => {
    const salt = new Uint8Array(16);
    const a = pbkdf2HmacSha256(stringToBytes('pw-a'), salt, 100, 48);
    const b = pbkdf2HmacSha256(stringToBytes('pw-b'), salt, 100, 48);
    expect(a.length).toBe(48);
    expect(b.length).toBe(48);
    expect(bytesToHex(a)).not.toBe(bytesToHex(b));
  });
});

describe('Ed25519', () => {
  test('round-trip sign/verify', () => {
    const { publicKey, secretKey } = ed25519GenerateKeyPair();
    const message = stringToBytes('a message to sign');
    const sig = ed25519Sign(secretKey, message);
    expect(ed25519Verify(publicKey, message, sig)).toBe(true);
  });

  test('tampered message fails verification', () => {
    const { publicKey, secretKey } = ed25519GenerateKeyPair();
    const sig = ed25519Sign(secretKey, stringToBytes('good message'));
    expect(ed25519Verify(publicKey, stringToBytes('evil message'), sig)).toBe(false);
  });
});

describe('concatBytes', () => {
  test('concatenates in order', () => {
    expect(bytesToHex(concatBytes(hexToBytes('deadbeef'), hexToBytes('cafe')))).toBe('deadbeefcafe');
  });
});

import { hkdf } from '@stablelib/hkdf';
import { KeyManager } from './KeyManager';
import { PreKeyBundle, X3DHResult } from '../../types/crypto';

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

function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export class X3DH {
  static async performKeyExchange(
    senderIdentityKeyPair: { publicKey: string; privateKey: string },
    preKeyBundle: PreKeyBundle,
  ): Promise<X3DHResult> {
    const ephemeralKeyPair = await KeyManager.generateKeyPair();

    const dh1 = await KeyManager.computeDH(senderIdentityKeyPair.privateKey, preKeyBundle.signedPreKey);
    const dh2 = await KeyManager.computeDH(ephemeralKeyPair.privateKey, preKeyBundle.identityKey);
    const dh3 = await KeyManager.computeDH(ephemeralKeyPair.privateKey, preKeyBundle.signedPreKey);
    const dh4 = await KeyManager.computeDH(ephemeralKeyPair.privateKey, preKeyBundle.oneTimePreKey);

    const sharedSecret = await this.kdf(
      dh1 + ':' + dh2 + ':' + dh3 + ':' + dh4,
      `x3dh:${senderIdentityKeyPair.publicKey}:${preKeyBundle.userId}`,
    );

    return {
      sharedSecret,
      sessionEstablished: true,
      ephemeralKeyPair,
    };
  }

  static async kdf(input: string, info: string): Promise<string> {
    const ikmBytes = hexToBytes(input);
    const salt = stringToBytes('ojchat-x3dh-salt');
    const infoBytes = stringToBytes(info);
    const okm = hkdf(ikmBytes, salt, infoBytes, 32);
    return bytesToHex(new Uint8Array(okm));
  }

  static async processPreKeyBundle(
    identityKeyPair: { publicKey: string; privateKey: string },
    preKeyBundle: PreKeyBundle,
  ): Promise<{ sharedSecret: string; sessionId: string }> {
    const result = await this.performKeyExchange(identityKeyPair, preKeyBundle);
    const sessionId = `${preKeyBundle.userId}:${preKeyBundle.deviceId}`;
    return {
      sharedSecret: result.sharedSecret,
      sessionId,
    };
  }
}

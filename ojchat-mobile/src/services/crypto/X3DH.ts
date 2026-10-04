import { KeyManager } from './KeyManager';
import { PreKeyBundle, X3DHResult } from '../../types/crypto';
import { bytesToHex, hexToBytes, stringToBytes, concatBytes, hkdfSha256 } from './primitives';
import { STORAGE_KEYS } from '../../constants/storageKeys';

const X3DH_SALT = STORAGE_KEYS.X3DH_SALT;

export class X3DH {
  static async performKeyExchange(
    senderIdentityKeyPair: { publicKey: string; privateKey: string },
    preKeyBundle: PreKeyBundle,
  ): Promise<X3DHResult> {
    this.verifyPreKeyBundle(preKeyBundle);

    const ephemeralKeyPair = await KeyManager.generateKeyPair();

    const dhOutputs: string[] = [
      await KeyManager.computeDH(senderIdentityKeyPair.privateKey, preKeyBundle.signedPreKey),
      await KeyManager.computeDH(ephemeralKeyPair.privateKey, preKeyBundle.identityKey),
      await KeyManager.computeDH(ephemeralKeyPair.privateKey, preKeyBundle.signedPreKey),
    ];

    if (preKeyBundle.oneTimePreKey) {
      dhOutputs.push(
        await KeyManager.computeDH(ephemeralKeyPair.privateKey, preKeyBundle.oneTimePreKey),
      );
    }

    const ikm = concatBytes(...dhOutputs.map(hexToBytes));
    const info = stringToBytes(`x3dh:${senderIdentityKeyPair.publicKey}:${preKeyBundle.userId}`);

    const sharedSecret = bytesToHex(hkdfSha256(ikm, stringToBytes(X3DH_SALT), info, 32));

    return {
      sharedSecret,
      sessionEstablished: true,
      ephemeralKeyPair,
    };
  }

  static verifyPreKeyBundle(preKeyBundle: PreKeyBundle): void {
    const valid = KeyManager.verifySignedPreKeySignature(
      preKeyBundle.identitySigningKey,
      preKeyBundle.signedPreKey,
      preKeyBundle.signedPreKeyId,
      preKeyBundle.signedPreKeySignature,
    );
    if (!valid) {
      throw new Error('Invalid signed prekey signature');
    }
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

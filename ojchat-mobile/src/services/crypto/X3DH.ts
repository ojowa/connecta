import * as Crypto from 'expo-crypto';
import { KeyManager } from './KeyManager';
import { PreKeyBundle, X3DHResult } from '../../types/crypto';

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
    const prk = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      'ojchat-x3dh-salt:' + input,
    );
    const output = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      prk + ':' + info + ':01',
    );
    return output;
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

import { KeyManager } from './KeyManager';
import { X3DH } from './X3DH';
import { DoubleRatchet } from './DoubleRatchet';
import { EncryptedMessage, RatchetState, PreKeyBundle } from '../../types/crypto';

export class MessageEncryptor {
  static async encryptMessage(
    recipientId: string,
    deviceId: number,
    plaintext: string,
    preKeyBundle?: PreKeyBundle,
  ): Promise<EncryptedMessage> {
    const identityKeyPair = await KeyManager.getIdentityKeyPair();
    if (!identityKeyPair) {
      throw new Error('No identity key pair found. Generate keys first.');
    }

    const sessionId = `${recipientId}:${deviceId}`;
    let ratchetState = await KeyManager.getRatchetState(sessionId);

    if (!ratchetState && preKeyBundle) {
      const x3dhResult = await X3DH.performKeyExchange(
        { publicKey: identityKeyPair.publicKey, privateKey: identityKeyPair.privateKey },
        preKeyBundle,
      );

      ratchetState = await DoubleRatchet.initializeAsSender(
        x3dhResult.sharedSecret,
        preKeyBundle.identityKey,
        preKeyBundle.signedPreKey,
      );
      await KeyManager.storeRatchetState(sessionId, ratchetState);
    }

    if (!ratchetState) {
      throw new Error('No session established. Provide preKeyBundle for first message.');
    }

    const { ciphertext, iv, mac, newState } = await DoubleRatchet.encryptMessage(
      ratchetState,
      plaintext,
    );

    await KeyManager.storeRatchetState(sessionId, newState);

    return {
      cipherText: ciphertext,
      iv,
      mac,
      ephemeralPublicKey: newState.localEphemeralKeyPair.publicKey,
      messageNumber: newState.sendingMessageNumber - 1,
      previousChainLength: newState.previousSendingChainLength,
      type: 'message',
      timestamp: Date.now(),
    };
  }

  static async decryptMessage(
    senderId: string,
    deviceId: number,
    encryptedMessage: EncryptedMessage,
  ): Promise<string> {
    const identityKeyPair = await KeyManager.getIdentityKeyPair();
    if (!identityKeyPair) {
      throw new Error('No identity key pair found.');
    }

    const sessionId = `${senderId}:${deviceId}`;
    let ratchetState = await KeyManager.getRatchetState(sessionId);

    if (!ratchetState) {
      throw new Error('No session found for sender. Session not established.');
    }

    const { plaintext, newState } = await DoubleRatchet.decryptMessage(
      ratchetState,
      encryptedMessage.cipherText,
      encryptedMessage.iv,
      encryptedMessage.mac,
      encryptedMessage.messageNumber,
      encryptedMessage.ephemeralPublicKey,
    );

    await KeyManager.storeRatchetState(sessionId, newState);

    return plaintext;
  }

  static async establishSession(
    recipientId: string,
    deviceId: number,
    preKeyBundle: PreKeyBundle,
  ): Promise<void> {
    const identityKeyPair = await KeyManager.getIdentityKeyPair();
    if (!identityKeyPair) {
      throw new Error('No identity key pair found. Generate keys first.');
    }

    const { sharedSecret } = await X3DH.processPreKeyBundle(
      { publicKey: identityKeyPair.publicKey, privateKey: identityKeyPair.privateKey },
      preKeyBundle,
    );

    const ratchetState = await DoubleRatchet.initializeAsSender(
      sharedSecret,
      preKeyBundle.identityKey,
      preKeyBundle.signedPreKey,
    );

    const sessionId = `${recipientId}:${deviceId}`;
    await KeyManager.storeRatchetState(sessionId, ratchetState);
  }

  static async sessionExists(recipientId: string, deviceId: number): Promise<boolean> {
    const sessionId = `${recipientId}:${deviceId}`;
    const state = await KeyManager.getRatchetState(sessionId);
    return state !== null;
  }

  static async deleteSession(recipientId: string, deviceId: number): Promise<void> {
    const sessionId = `${recipientId}:${deviceId}`;
    await KeyManager.deleteRatchetState(sessionId);
    await KeyManager.deleteSessionKey(sessionId);
  }
}

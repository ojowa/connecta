import * as Crypto from 'expo-crypto';
import { RatchetState } from '../../types/crypto';
import { KeyManager } from './KeyManager';

export class DoubleRatchet {
  static async initializeAsSender(
    sharedSecret: string,
    remoteIdentityKey: string,
    remoteSignedPreKey: string,
  ): Promise<RatchetState> {
    const localEphemeralKeyPair = await KeyManager.generateKeyPair();
    const rootKey = sharedSecret;
    const { rootKey: newRootKey, chainKey: sendingChainKey } = await this.kdfRK(
      rootKey,
      localEphemeralKeyPair.privateKey + remoteSignedPreKey,
    );

    return {
      rootKey: newRootKey,
      sendingChainKey,
      receivingChainKey: '',
      sendingMessageNumber: 0,
      receivingMessageNumber: 0,
      previousSendingChainLength: 0,
      remoteIdentityKey,
      remoteSignedPreKey,
      localEphemeralKeyPair,
      lastRemoteEphemeralKey: '',
      timestamp: Date.now(),
    };
  }

  static async initializeAsReceiver(
    sharedSecret: string,
    remoteIdentityKey: string,
    remoteEphemeralKey: string,
    localSignedPreKeyPair: { publicKey: string; privateKey: string },
  ): Promise<RatchetState> {
    const rootKey = sharedSecret;
    const { rootKey: newRootKey, chainKey: receivingChainKey } = await this.kdfRK(
      rootKey,
      localSignedPreKeyPair.privateKey + remoteEphemeralKey,
    );

    return {
      rootKey: newRootKey,
      sendingChainKey: '',
      receivingChainKey,
      sendingMessageNumber: 0,
      receivingMessageNumber: 0,
      previousSendingChainLength: 0,
      remoteIdentityKey,
      remoteSignedPreKey: '',
      localEphemeralKeyPair: localSignedPreKeyPair,
      lastRemoteEphemeralKey: remoteEphemeralKey,
      timestamp: Date.now(),
    };
  }

  static async encryptMessage(
    state: RatchetState,
    plaintext: string,
  ): Promise<{ ciphertext: string; iv: string; mac: string; newState: RatchetState }> {
    const { messageKey, chainKey: newSendingChainKey } = await this.kdfCK(
      state.sendingChainKey,
    );
    const iv = await KeyManager.generateRandomBytes(16);
    const cipherText = await this.aesEncrypt(plaintext, messageKey, iv);
    const mac = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      messageKey + cipherText + iv,
    );

    const newState: RatchetState = {
      ...state,
      sendingChainKey: newSendingChainKey,
      sendingMessageNumber: state.sendingMessageNumber + 1,
      timestamp: Date.now(),
    };

    return { ciphertext: cipherText, iv, mac, newState };
  }

  static async decryptMessage(
    state: RatchetState,
    ciphertext: string,
    iv: string,
    mac: string,
    messageNumber: number,
  ): Promise<{ plaintext: string; newState: RatchetState }> {
    const { messageKey, chainKey: newReceivingChainKey } = await this.kdfCK(
      state.receivingChainKey,
    );

    const expectedMac = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      messageKey + ciphertext + iv,
    );

    if (mac !== expectedMac) {
      throw new Error('MAC verification failed');
    }

    const plaintext = await this.aesDecrypt(ciphertext, messageKey, iv);

    const newState: RatchetState = {
      ...state,
      receivingChainKey: newReceivingChainKey,
      receivingMessageNumber: messageNumber + 1,
      timestamp: Date.now(),
    };

    return { plaintext, newState };
  }

  static async performDH(
    privateKey: string,
    publicKey: string,
  ): Promise<string> {
    return Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      privateKey + publicKey,
    );
  }

  static async kdfRK(
    rootKey: string,
    dhOutput: string,
  ): Promise<{ rootKey: string; chainKey: string }> {
    const input = rootKey + dhOutput;
    const newRootKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      input + ':rk',
    );
    const chainKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      input + ':ck',
    );
    return { rootKey: newRootKey, chainKey };
  }

  static async kdfCK(
    chainKey: string,
  ): Promise<{ messageKey: string; chainKey: string }> {
    const messageKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      chainKey + ':mk',
    );
    const newChainKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      chainKey + ':ck',
    );
    return { messageKey, chainKey: newChainKey };
  }

  static async aesEncrypt(plaintext: string, key: string, iv: string): Promise<string> {
    const data = new TextEncoder().encode(plaintext);
    const keyBytes = this.hexToBytes(key);
    const ivBytes = this.hexToBytes(iv);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(keyBytes),
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt'],
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: new Uint8Array(ivBytes), tagLength: 128 },
      cryptoKey,
      data,
    );

    return this.bytesToHex(new Uint8Array(encrypted));
  }

  static async aesDecrypt(cipherText: string, key: string, iv: string): Promise<string> {
    const cipherBytes = this.hexToBytes(cipherText);
    const keyBytes = this.hexToBytes(key);
    const ivBytes = this.hexToBytes(iv);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(keyBytes),
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(ivBytes), tagLength: 128 },
      cryptoKey,
      new Uint8Array(cipherBytes),
    );

    return new TextDecoder().decode(decrypted);
  }

  static hexToBytes(hex: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substring(i, i + 2), 16));
    }
    return bytes;
  }

  static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

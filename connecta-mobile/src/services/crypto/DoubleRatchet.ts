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

    const receivingChainKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      newRootKey + ':init-receiving-chain',
    );

    return {
      rootKey: newRootKey,
      sendingChainKey,
      receivingChainKey,
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

    const sendingChainKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      newRootKey + ':init-sending-chain',
    );

    return {
      rootKey: newRootKey,
      sendingChainKey,
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
      messageKey + ':mac:' + cipherText + ':' + iv,
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
    senderEphemeralKey?: string,
  ): Promise<{ plaintext: string; newState: RatchetState }> {
    let workingState = { ...state };

    if (senderEphemeralKey && senderEphemeralKey !== state.lastRemoteEphemeralKey) {
      const dhOutput = await this.computeDH(
        state.localEphemeralKeyPair.privateKey,
        senderEphemeralKey,
      );

      const { rootKey: newRootKey, chainKey: receivingChainKey } = await this.kdfRK(
        workingState.rootKey,
        dhOutput,
      );

      const newEphemeralKeyPair = await KeyManager.generateKeyPair();
      const dhOutput2 = await this.computeDH(
        newEphemeralKeyPair.privateKey,
        senderEphemeralKey,
      );

      const { rootKey: finalRootKey, chainKey: newSendingChainKey } = await this.kdfRK(
        newRootKey,
        dhOutput2,
      );

      workingState = {
        ...workingState,
        rootKey: finalRootKey,
        previousSendingChainLength: workingState.sendingMessageNumber,
        sendingChainKey: newSendingChainKey,
        sendingMessageNumber: 0,
        receivingChainKey,
        receivingMessageNumber: 0,
        localEphemeralKeyPair: newEphemeralKeyPair,
        lastRemoteEphemeralKey: senderEphemeralKey,
      };
    }

    const { messageKey, chainKey: newReceivingChainKey } = await this.kdfCK(
      workingState.receivingChainKey,
    );

    const expectedMac = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      messageKey + ':mac:' + ciphertext + ':' + iv,
    );

    if (mac !== expectedMac) {
      throw new Error('MAC verification failed');
    }

    const plaintext = await this.aesDecrypt(ciphertext, messageKey, iv);

    const newState: RatchetState = {
      ...workingState,
      receivingChainKey: newReceivingChainKey,
      receivingMessageNumber: messageNumber + 1,
      timestamp: Date.now(),
    };

    return { plaintext, newState };
  }

  static async computeDH(privateKey: string, publicKey: string): Promise<string> {
    return Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      'connecta-dh:' + privateKey + ':' + publicKey,
    );
  }

  static async kdfRK(
    rootKey: string,
    dhOutput: string,
  ): Promise<{ rootKey: string; chainKey: string }> {
    const input = rootKey + ':rkdh:' + dhOutput;
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

    const keyStream = await this.generateKeyStream(keyBytes, ivBytes, data.length);
    const encrypted = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      encrypted[i] = data[i] ^ keyStream[i];
    }

    const tag = await this.computeGCMTag(keyBytes, ivBytes, encrypted);
    const result = new Uint8Array(encrypted.length + 16);
    result.set(encrypted);
    result.set(tag, encrypted.length);

    return this.bytesToHex(result);
  }

  static async aesDecrypt(cipherText: string, key: string, iv: string): Promise<string> {
    const allBytes = this.hexToBytes(cipherText);
    const keyBytes = this.hexToBytes(key);
    const ivBytes = this.hexToBytes(iv);

    if (allBytes.length < 16) {
      throw new Error('Ciphertext too short');
    }

    const encrypted = new Uint8Array(allBytes.slice(0, allBytes.length - 16));
    const receivedTag = new Uint8Array(allBytes.slice(allBytes.length - 16));

    const expectedTag = await this.computeGCMTag(keyBytes, ivBytes, encrypted);
    if (!this.constantTimeCompare(receivedTag, expectedTag)) {
      throw new Error('Authentication tag verification failed');
    }

    const keyStream = await this.generateKeyStream(keyBytes, ivBytes, encrypted.length);
    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ keyStream[i];
    }

    return new TextDecoder().decode(decrypted);
  }

  private static async generateKeyStream(
    key: number[],
    iv: number[],
    length: number,
  ): Promise<Uint8Array> {
    const stream = new Uint8Array(length);
    const blocksNeeded = Math.ceil(length / 32);

    for (let block = 0; block < blocksNeeded; block++) {
      const counter = new Uint8Array(16);
      counter.set(new Uint8Array(iv.slice(0, 12)));
      counter[12] = (block >> 24) & 0xff;
      counter[13] = (block >> 16) & 0xff;
      counter[14] = (block >> 8) & 0xff;
      counter[15] = block & 0xff;

      const keyInput = new Uint8Array(key);
      const hashInput = new Uint8Array(keyInput.length + counter.length);
      hashInput.set(keyInput);
      hashInput.set(counter, keyInput.length);

      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        this.bytesToHex(hashInput),
      );

      const hashBytes = this.hexToBytes(hash);
      const offset = block * 32;
      const toCopy = Math.min(32, length - offset);
      for (let i = 0; i < toCopy; i++) {
        stream[offset + i] = hashBytes[i];
      }
    }

    return stream;
  }

  private static async computeGCMTag(
    key: number[],
    iv: number[],
    ciphertext: Uint8Array,
  ): Promise<Uint8Array> {
    const tagInput = `connecta-gcm:${this.bytesToHex(new Uint8Array(key))}:${this.bytesToHex(new Uint8Array(iv))}:${this.bytesToHex(ciphertext)}`;
    const tagHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      tagInput,
    );
    return new Uint8Array(this.hexToBytes(tagHash).slice(0, 16));
  }

  private static constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
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

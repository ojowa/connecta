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
      await KeyManager.computeDH(localEphemeralKeyPair.privateKey, remoteSignedPreKey),
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
      skippedMessageKeys: [],
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
      await KeyManager.computeDH(localSignedPreKeyPair.privateKey, remoteEphemeralKey),
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
      skippedMessageKeys: [],
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
    let workingState = { ...state, skippedMessageKeys: [...state.skippedMessageKeys] };

    if (senderEphemeralKey && senderEphemeralKey !== state.lastRemoteEphemeralKey) {
      const dhOutput = await KeyManager.computeDH(
        workingState.localEphemeralKeyPair.privateKey,
        senderEphemeralKey,
      );

      const { rootKey: newRootKey, chainKey: receivingChainKey } = await this.kdfRK(
        workingState.rootKey,
        dhOutput,
      );

      const newEphemeralKeyPair = await KeyManager.generateKeyPair();
      const dhOutput2 = await KeyManager.computeDH(
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

    const skippedKeyIndex = workingState.skippedMessageKeys.findIndex(
      (k) => k.messageNumber === messageNumber,
    );

    if (skippedKeyIndex >= 0) {
      const { messageKey: skippedMessageKey } = await this.kdfCK(
        workingState.skippedMessageKeys[skippedKeyIndex].chainKey,
      );
      workingState.skippedMessageKeys.splice(skippedKeyIndex, 1);

      const expectedMac = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        skippedMessageKey + ':mac:' + ciphertext + ':' + iv,
      );

      if (mac !== expectedMac) {
        throw new Error('MAC verification failed');
      }

      const plaintext = await this.aesDecrypt(ciphertext, skippedMessageKey, iv);
      return {
        plaintext,
        newState: { ...workingState, timestamp: Date.now() },
      };
    }

    if (messageNumber < workingState.receivingMessageNumber) {
      throw new Error(`Message ${messageNumber} already received (expected ${workingState.receivingMessageNumber})`);
    }

    let currentChainKey = workingState.receivingChainKey;
    let skippedKeysNeeded = messageNumber - workingState.receivingMessageNumber;

    while (skippedKeysNeeded > 0) {
      const { messageKey: skipMessageKey, chainKey: nextChainKey } = await this.kdfCK(currentChainKey);
      workingState.skippedMessageKeys.push({
        messageNumber: workingState.receivingMessageNumber + (messageNumber - skippedKeysNeeded),
        chainKey: currentChainKey,
      });
      currentChainKey = nextChainKey;
      skippedKeysNeeded--;
    }

    const { messageKey, chainKey: newReceivingChainKey } = await this.kdfCK(currentChainKey);

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
    const keyBytes = KeyManager.hexToBytes(key);
    const ivBytes = KeyManager.hexToBytes(iv);

    const keyStream = await this.generateKeyStream(keyBytes, ivBytes, data.length);
    const encrypted = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      encrypted[i] = data[i] ^ keyStream[i];
    }

    const tag = await this.computeGCMTag(keyBytes, ivBytes, encrypted);
    const result = new Uint8Array(encrypted.length + 16);
    result.set(encrypted);
    result.set(tag, encrypted.length);

    return KeyManager.bytesToHex(result);
  }

  static async aesDecrypt(cipherText: string, key: string, iv: string): Promise<string> {
    const allBytes = KeyManager.hexToBytes(cipherText);
    const keyBytes = KeyManager.hexToBytes(key);
    const ivBytes = KeyManager.hexToBytes(iv);

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
    key: Uint8Array,
    iv: Uint8Array,
    length: number,
  ): Promise<Uint8Array> {
    const stream = new Uint8Array(length);
    const blocksNeeded = Math.ceil(length / 32);

    for (let block = 0; block < blocksNeeded; block++) {
      const counter = new Uint8Array(16);
      counter.set(iv.slice(0, 12));
      counter[12] = (block >> 24) & 0xff;
      counter[13] = (block >> 16) & 0xff;
      counter[14] = (block >> 8) & 0xff;
      counter[15] = block & 0xff;

      const hashInput = KeyManager.bytesToHex(new Uint8Array([...key, ...counter]));
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        hashInput,
      );

      const hashBytes = KeyManager.hexToBytes(hash);
      const offset = block * 32;
      const toCopy = Math.min(32, length - offset);
      for (let i = 0; i < toCopy; i++) {
        stream[offset + i] = hashBytes[i];
      }
    }

    return stream;
  }

  private static async computeGCMTag(
    key: Uint8Array,
    iv: Uint8Array,
    ciphertext: Uint8Array,
  ): Promise<Uint8Array> {
    const tagInput = `ojchat-gcm:${KeyManager.bytesToHex(key)}:${KeyManager.bytesToHex(iv)}:${KeyManager.bytesToHex(ciphertext)}`;
    const tagHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      tagInput,
    );
    return new Uint8Array(KeyManager.hexToBytes(tagHash).slice(0, 16));
  }

  private static constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
  }
}

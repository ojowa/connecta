import * as Crypto from 'expo-crypto';
import { AESEncryptionKey, AESSealedData, aesEncryptAsync, aesDecryptAsync, AESKeySize } from 'expo-crypto';
import { hkdf } from '@stablelib/hkdf';
import { RatchetState } from '../../types/crypto';
import { KeyManager } from './KeyManager';

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

async function hkdfDerive(ikm: string, salt: string, info: string, length: number = 32): Promise<string> {
  const ikmBytes = hexToBytes(ikm);
  const saltBytes = stringToBytes(salt);
  const infoBytes = stringToBytes(info);
  const okm = hkdf(ikmBytes, saltBytes, infoBytes, length);
  return bytesToHex(new Uint8Array(okm));
}

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

    const receivingChainKey = await hkdfDerive(newRootKey, 'ojchat-rk', 'init-receiving-chain');

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

    const sendingChainKey = await hkdfDerive(newRootKey, 'ojchat-rk', 'init-sending-chain');

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

    const key = await AESEncryptionKey.fromHex(messageKey);
    const ivBytes = Crypto.getRandomValues(new Uint8Array(12));
    const plaintextBytes = new TextEncoder().encode(plaintext);

    const sealed = await aesEncryptAsync(plaintextBytes, key, {
      nonce: { bytes: ivBytes },
    });

    const ciphertext = bytesToHex(new Uint8Array(await sealed.ciphertext()));
    const tag = bytesToHex(new Uint8Array(await sealed.tag()));
    const iv = bytesToHex(ivBytes);
    const mac = tag;

    const newState: RatchetState = {
      ...state,
      sendingChainKey: newSendingChainKey,
      sendingMessageNumber: state.sendingMessageNumber + 1,
      timestamp: Date.now(),
    };

    return { ciphertext, iv, mac, newState };
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

      const plaintext = await this.aesDecryptWithKey(ciphertext, iv, mac, skippedMessageKey);
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

    const plaintext = await this.aesDecryptWithKey(ciphertext, iv, mac, messageKey);

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
    const newRootKey = await hkdfDerive(dhOutput, rootKey, 'ojchat-rk-root', 32);
    const chainKey = await hkdfDerive(dhOutput, rootKey, 'ojchat-rk-chain', 32);
    return { rootKey: newRootKey, chainKey };
  }

  static async kdfCK(
    chainKey: string,
  ): Promise<{ messageKey: string; chainKey: string }> {
    const messageKey = await hkdfDerive('01', chainKey, 'ojchat-ck-mk', 32);
    const newChainKey = await hkdfDerive('02', chainKey, 'ojchat-ck-ck', 32);
    return { messageKey, chainKey: newChainKey };
  }

  private static async aesDecryptWithKey(
    ciphertext: string,
    iv: string,
    mac: string,
    messageKey: string,
  ): Promise<string> {
    const key = await AESEncryptionKey.fromHex(messageKey);
    const ivBytes = hexToBytes(iv);
    const ciphertextBytes = hexToBytes(ciphertext);
    const tagBytes = hexToBytes(mac);

    const sealed = AESSealedData.fromParts(ivBytes, ciphertextBytes, tagBytes);
    const decrypted = await aesDecryptAsync(sealed, key, { output: 'bytes' });
    return new TextDecoder().decode(new Uint8Array(decrypted));
  }
}

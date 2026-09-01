export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface IdentityKeyPair extends KeyPair {
  keyId: string;
}

export interface SigningKeyPair extends KeyPair {
  keyId: string;
}

export interface SignedPreKey extends KeyPair {
  keyId: number;
  signature: string;
  createdAt: number;
}

export interface OneTimePreKey extends KeyPair {
  keyId: number;
  used: boolean;
  createdAt: number;
}

export interface PreKeyBundle {
  userId: string;
  deviceId: number;
  identityKey: string;
  identitySigningKey: string;
  signedPreKeyId: number;
  signedPreKey: string;
  signedPreKeySignature: string;
  oneTimePreKeyId: number;
  oneTimePreKey: string;
}

export interface X3DHResult {
  sharedSecret: string;
  sessionEstablished: boolean;
  ephemeralKeyPair: KeyPair;
}

export interface RatchetState {
  rootKey: string;
  sendingChainKey: string;
  receivingChainKey: string;
  sendingMessageNumber: number;
  receivingMessageNumber: number;
  previousSendingChainLength: number;
  remoteIdentityKey: string;
  remoteSignedPreKey: string;
  localEphemeralKeyPair: KeyPair;
  lastRemoteEphemeralKey: string;
  skippedMessageKeys: { messageNumber: number; chainKey: string }[];
  timestamp: number;
}

export interface EncryptedMessage {
  cipherText: string;
  iv: string;
  mac: string;
  ephemeralPublicKey: string;
  messageNumber: number;
  previousChainLength: number;
  type: 'message' | 'session_init' | 'prekey' | 'key_exchange';
  timestamp: number;
}

export interface EncryptedFile {
  uri: string;
  key: string;
  iv: string;
  mac: string;
  mimeType: string;
  size: number;
}

export interface BackupData {
  encryptedBundle: string;
  verificationMac: string;
  salt: string;
  iv: string;
  iterations: number;
  deviceId: string;
  timestamp: number;
}

export interface KeyRotationConfig {
  signedPreKeyRotationDays: number;
  oneTimePreKeyThreshold: number;
  oneTimePreKeyBatchSize: number;
}

export const DEFAULT_KEY_ROTATION_CONFIG: KeyRotationConfig = {
  signedPreKeyRotationDays: 7,
  oneTimePreKeyThreshold: 20,
  oneTimePreKeyBatchSize: 100,
};

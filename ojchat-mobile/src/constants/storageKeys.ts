export const STORAGE_KEYS = {
  // MMKV
  MMKV_ID: 'ojchat-secure',
  MMKV_ENCRYPTION_KEY: 'com.ojchat.mmkv.encryption',

  // Secure Storage (Keychain)
  SECURE_SERVICE: 'com.ojchat.secure',
  AUTH_PERSIST: 'ojchat-auth-storage',
  DEVTOOLS_NAME: 'OJChatStore',

  // Biometric
  BIOMETRIC_AUTH: 'com.ojchat.auth',

  // Crypto
  CRYPTO_SERVICE: 'com.ojchat.crypto',
  DB_KEY: 'com.ojchat.crypto.db-key',
  SIGNING_KEY: 'com.ojchat.crypto.signing-key',
  BACKUP_SERVICE: 'com.ojchat.backup',
  X3DH_SALT: 'ojchat-x3dh-salt',

  // Double Ratchet
  RK_LABEL: 'ojchat-rk',
  RK_ROOT: 'ojchat-rk-root',
  RK_CHAIN: 'ojchat-rk-chain',
  CK_MK: 'ojchat-ck-mk',
  CK_CK: 'ojchat-ck-ck',
  SPK_LABEL: 'ojchat-spk',
};

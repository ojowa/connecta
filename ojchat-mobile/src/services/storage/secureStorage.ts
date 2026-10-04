import * as Keychain from 'react-native-keychain';
import { STORAGE_KEYS } from '../../constants/storageKeys';

const SERVICE_NAME = STORAGE_KEYS.SECURE_SERVICE;

export class SecureStorageError extends Error {
  constructor(
    public readonly operation: 'get' | 'set' | 'remove' | 'clear',
    public readonly key: string,
    public readonly cause: unknown,
  ) {
    super(
      `Secure storage ${operation} failed for key "${key}": ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
    );
    this.name = 'SecureStorageError';
  }
}

async function tryOrThrow<T>(
  op: 'get' | 'set' | 'remove' | 'clear',
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw new SecureStorageError(op, key, err);
  }
}

export const secureStorage = {
  async set(key: string, value: string): Promise<void> {
    await tryOrThrow('set', key, () =>
      Keychain.setGenericPassword(key, value, {
        service: `${SERVICE_NAME}.${key}`,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
      }),
    );
  },

  async get(key: string): Promise<string | null> {
    try {
      const credentials = await tryOrThrow('get', key, () =>
        Keychain.getGenericPassword({ service: `${SERVICE_NAME}.${key}` }),
      );
      return credentials ? credentials.password : null;
    } catch (err) {
      if (err instanceof SecureStorageError) {
        throw err;
      }
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    await tryOrThrow('remove', key, () =>
      Keychain.resetGenericPassword({ service: `${SERVICE_NAME}.${key}` }),
    );
  },

  async clear(): Promise<void> {
    await tryOrThrow('clear', '*', () => Keychain.resetGenericPassword({ service: SERVICE_NAME }));
  },
};

import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'com.ojchat.secure';

export const secureStorage = {
  async set(key: string, value: string): Promise<boolean> {
    try {
      await Keychain.setGenericPassword(key, value, {
        service: `${SERVICE_NAME}.${key}`,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
      });
      return true;
    } catch {
      return false;
    }
  },

  async get(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${SERVICE_NAME}.${key}`,
      });
      return credentials ? credentials.password : null;
    } catch {
      return null;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({ service: `${SERVICE_NAME}.${key}` });
      return true;
    } catch {
      return false;
    }
  },

  async clear(): Promise<void> {
    await Keychain.resetGenericPassword({ service: SERVICE_NAME });
  },
};

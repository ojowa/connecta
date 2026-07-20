import { createMMKV, MMKV } from 'react-native-mmkv';

const storage: MMKV = createMMKV();

export const mmkvStorage = {
  getString: (key: string): string | undefined => {
    return storage.getString(key);
  },
  set: (key: string, value: string): void => {
    storage.set(key, value);
  },
  remove: (key: string): void => {
    storage.remove(key);
  },
  contains: (key: string): boolean => {
    return storage.contains(key);
  },
  getAllKeys: (): string[] => {
    return storage.getAllKeys();
  },
  clearAll: (): void => {
    storage.clearAll();
  },
};

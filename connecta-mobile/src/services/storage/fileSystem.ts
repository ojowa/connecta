import { Paths, File, Directory } from 'expo-file-system';

const CACHE_DIR_PATH = `${Paths.cache.uri}connecta/`;

async function ensureCacheDir(): Promise<Directory> {
  const dir = new Directory(CACHE_DIR_PATH);
  if (!dir.exists) {
    dir.create();
  }
  return dir;
}

export const fileSystem = {
  async ensureCacheDir(): Promise<string> {
    await ensureCacheDir();
    return CACHE_DIR_PATH;
  },

  async saveToLocal(uri: string, filename: string): Promise<string> {
    await ensureCacheDir();
    const source = new File(uri);
    const dest = new File(`${CACHE_DIR_PATH}${filename}`);
    source.move(dest);
    return dest.uri;
  },

  async deleteFile(uri: string): Promise<void> {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  },

  async getFileInfo(uri: string): Promise<{ uri: string; exists: boolean; size?: number } | null> {
    const file = new File(uri);
    if (file.exists) {
      return { uri: file.uri, exists: true, size: file.size };
    }
    return null;
  },

  async clearCache(): Promise<void> {
    const dir = new Directory(CACHE_DIR_PATH);
    if (dir.exists) {
      dir.delete();
    }
  },
};

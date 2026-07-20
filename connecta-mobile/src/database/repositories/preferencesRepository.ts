import { getDatabase } from '../connection';

export interface LocalPreference {
  key: string;
  value: string;
  updatedAt: number;
  synced: boolean;
}

export class PreferencesRepository {
  static async get(key: string): Promise<string | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM local_preferences WHERE key = ?',
      [key],
    );
    return row?.value || null;
  }

  static async getTyped<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  static async set(key: string, value: any): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    await db.runAsync(
      `INSERT OR REPLACE INTO local_preferences (key, value, updated_at, synced)
       VALUES (?, ?, ?, 0)`,
      [key, stringValue, now],
    );
  }

  static async setBatch(prefs: Record<string, any>): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();

    for (const [key, value] of Object.entries(prefs)) {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await db.runAsync(
        `INSERT OR REPLACE INTO local_preferences (key, value, updated_at, synced)
         VALUES (?, ?, ?, 0)`,
        [key, stringValue, now],
      );
    }
  }

  static async markSynced(key: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE local_preferences SET synced = 1 WHERE key = ?',
      [key],
    );
  }

  static async getUnsynced(): Promise<LocalPreference[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ key: string; value: string; updated_at: number; synced: number }>(
      "SELECT * FROM local_preferences WHERE synced = 0 ORDER BY updated_at ASC",
    );
    return rows.map((row: { key: string; value: string; updated_at: number; synced: number }) => ({
      key: row.key,
      value: row.value,
      updatedAt: row.updated_at,
      synced: row.synced === 1,
    }));
  }

  static async delete(key: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM local_preferences WHERE key = ?', [key]);
  }

  static async getAll(): Promise<LocalPreference[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ key: string; value: string; updated_at: number; synced: number }>(
      'SELECT * FROM local_preferences ORDER BY updated_at DESC',
    );
    return rows.map((row: { key: string; value: string; updated_at: number; synced: number }) => ({
      key: row.key,
      value: row.value,
      updatedAt: row.updated_at,
      synced: row.synced === 1,
    }));
  }
}

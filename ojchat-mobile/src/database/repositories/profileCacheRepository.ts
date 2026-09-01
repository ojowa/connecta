import { getDatabase } from '../connection';

export interface ProfileCacheData {
  userId: string;
  firstName: string;
  lastName?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  jobTitle?: string;
  company?: string;
  school?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  relationshipGoal?: string;
  verified?: boolean;
  completionPercentage?: number;
  photos?: Array<{ id: string; url: string; isPrimary: boolean; position: number }>;
  interests?: Array<{ id: string; name: string }>;
  updatedAt?: number;
}

export class ProfileCacheRepository {
  static async get(userId: string): Promise<ProfileCacheData | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ data: string; version: number; cached_at: number }>(
      'SELECT data, version, cached_at FROM local_profile_cache WHERE user_id = ?',
      [userId],
    );
    if (!row) return null;
    return { ...JSON.parse(row.data), _version: row.version, _cachedAt: row.cached_at };
  }

  static async upsert(userId: string, data: ProfileCacheData): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();

    const existing = await db.getFirstAsync<{ data: string; version: number }>(
      'SELECT data, version FROM local_profile_cache WHERE user_id = ?',
      [userId],
    );

    if (existing) {
      const existingData = JSON.parse(existing.data);
      const hasChanged = JSON.stringify(existingData) !== JSON.stringify(data);
      if (!hasChanged) return;

      await db.runAsync(
        `INSERT OR REPLACE INTO local_profile_cache (user_id, data, version, cached_at)
         VALUES (?, ?, ?, ?)`,
        [userId, JSON.stringify(data), existing.version + 1, now],
      );
    } else {
      await db.runAsync(
        `INSERT OR REPLACE INTO local_profile_cache (user_id, data, version, cached_at)
         VALUES (?, ?, ?, ?)`,
        [userId, JSON.stringify(data), 1, now],
      );
    }
  }

  static async getAll(): Promise<ProfileCacheData[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      user_id: string;
      data: string;
      version: number;
      cached_at: number;
    }>('SELECT user_id, data, version, cached_at FROM local_profile_cache ORDER BY cached_at DESC');
    return rows.map(
      (row: { user_id: string; data: string; version: number; cached_at: number }) => ({
        ...JSON.parse(row.data),
        userId: row.user_id,
        _version: row.version,
        _cachedAt: row.cached_at,
      }),
    );
  }

  static async delete(userId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM local_profile_cache WHERE user_id = ?', [userId]);
  }

  static async clearExpired(maxAgeMs: number): Promise<void> {
    const db = await getDatabase();
    const cutoff = Date.now() - maxAgeMs;
    await db.runAsync('DELETE FROM local_profile_cache WHERE cached_at < ?', [cutoff]);
  }
}

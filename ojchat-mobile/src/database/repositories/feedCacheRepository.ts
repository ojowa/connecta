import { getDatabase } from '../connection';

export interface FeedCacheItem {
  userId: string;
  data: string;
  score: number;
  cachedAt: number;
}

export class FeedCacheRepository {
  static async getAll(): Promise<FeedCacheItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      user_id: string;
      data: string;
      score: number;
      cached_at: number;
    }>('SELECT user_id, data, score, cached_at FROM local_feed_cache ORDER BY score DESC');
    return rows.map((row: { user_id: string; data: string; score: number; cached_at: number }) => ({
      userId: row.user_id,
      data: row.data,
      score: row.score,
      cachedAt: row.cached_at,
    }));
  }

  static async get(userId: string): Promise<FeedCacheItem | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ data: string; score: number; cached_at: number }>(
      'SELECT data, score, cached_at FROM local_feed_cache WHERE user_id = ?',
      [userId],
    );
    if (!row) return null;
    return {
      userId,
      data: row.data,
      score: row.score,
      cachedAt: row.cached_at,
    };
  }

  static async upsert(userId: string, data: string, score: number): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();

    await db.runAsync(
      `INSERT OR REPLACE INTO local_feed_cache (user_id, data, score, cached_at)
       VALUES (?, ?, ?, ?)`,
      [userId, data, score, now],
    );
  }

  static async upsertBatch(
    items: Array<{ userId: string; data: string; score: number }>,
  ): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();

    await db.execAsync('BEGIN TRANSACTION;');
    try {
      for (const item of items) {
        await db.runAsync(
          `INSERT OR REPLACE INTO local_feed_cache (user_id, data, score, cached_at)
           VALUES (?, ?, ?, ?)`,
          [item.userId, item.data, item.score, now],
        );
      }
      await db.execAsync('COMMIT;');
    } catch (error) {
      await db.execAsync('ROLLBACK;');
      throw error;
    }
  }

  static async delete(userId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM local_feed_cache WHERE user_id = ?', [userId]);
  }

  static async clearAll(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM local_feed_cache');
  }

  static async clearExpired(maxAgeMs: number): Promise<void> {
    const db = await getDatabase();
    const cutoff = Date.now() - maxAgeMs;
    await db.runAsync('DELETE FROM local_feed_cache WHERE cached_at < ?', [cutoff]);
  }

  static async getCount(): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM local_feed_cache',
    );
    return row?.count || 0;
  }
}

import { getDatabase } from '../connection';

export class SyncQueueRepository {
  static async enqueue(action: { id: string; type: string; payload: string; priority?: number }): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO sync_queue (id, type, payload, priority, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [action.id, action.type, action.payload, action.priority || 0]
    );
  }

  static async getPending(limit = 100): Promise<any[]> {
    const db = await getDatabase();
    return db.getAllAsync(
      `SELECT * FROM sync_queue WHERE status = 'pending'
       ORDER BY priority ASC, created_at ASC
       LIMIT ?`,
      [limit]
    );
  }

  static async markProcessing(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("UPDATE sync_queue SET status = 'processing' WHERE id = ?", [id]);
  }

  static async markCompleted(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("UPDATE sync_queue SET status = 'completed', completed_at = datetime('now') WHERE id = ?", [id]);
  }

  static async markFailed(id: string, error: string, retryCount: number): Promise<void> {
    const db = await getDatabase();
    if (retryCount >= 5) {
      await db.runAsync("UPDATE sync_queue SET status = 'failed', error = ? WHERE id = ?", [error, id]);
    } else {
      await db.runAsync("UPDATE sync_queue SET status = 'pending', retry_count = ? WHERE id = ?", [retryCount, id]);
    }
  }

  static async clearCompleted(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM sync_queue WHERE status = 'completed'");
  }
}

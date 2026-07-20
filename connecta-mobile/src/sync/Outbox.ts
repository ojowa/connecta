import { getDatabase } from '../database/connection';
import { NetworkManager } from './NetworkManager';
import { SyncEngine } from './SyncEngine';

export interface SyncOperation {
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  payload: Record<string, any>;
}

export class Outbox {
  static async enqueue(operation: SyncOperation): Promise<void> {
    const db = await getDatabase();
    const { entityType, entityId, operation: op, payload } = operation;

    await this.writeToLocal(entityType, entityId, payload);

    await db.runAsync(
      `INSERT INTO local_sync_outbox (operation, entity_type, entity_id, payload, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [op, entityType, entityId, JSON.stringify(payload), Date.now()],
    );

    if (NetworkManager.isConnected()) {
      SyncEngine.getInstance().triggerSync();
    }
  }

  private static async writeToLocal(
    entityType: string,
    entityId: string,
    payload: Record<string, any>,
  ): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();

    switch (entityType) {
      case 'message':
        await db.runAsync(
          `INSERT OR REPLACE INTO local_messages
           (id, conversation_id, sender_id, content, content_type, is_sent, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
          [
            entityId,
            payload.conversationId,
            payload.senderId,
            payload.content,
            payload.contentType || 'text',
            payload.createdAt || now,
            now,
          ],
        );
        break;

      case 'preference':
        await db.runAsync(
          `INSERT OR REPLACE INTO local_preferences (key, value, updated_at, synced)
           VALUES (?, ?, ?, 0)`,
          [entityId, JSON.stringify(payload.value), now],
        );
        break;

      case 'profile':
        const existing = await db.getFirstAsync<{ data: string; version: number }>(
          'SELECT data, version FROM local_profile_cache WHERE user_id = ?',
          [entityId],
        );
        const version = existing ? existing.version + 1 : 1;
        await db.runAsync(
          `INSERT OR REPLACE INTO local_profile_cache (user_id, data, version, cached_at)
           VALUES (?, ?, ?, ?)`,
          [entityId, JSON.stringify(payload), version, now],
        );
        break;

      case 'like':
      case 'pass':
      case 'super_like':
        break;
    }
  }

  static async getPending(limit = 50): Promise<any[]> {
    const db = await getDatabase();
    return db.getAllAsync(
      `SELECT * FROM local_sync_outbox
       WHERE status = 'pending' AND retry_count < 5
       ORDER BY
         CASE entity_type
           WHEN 'message' THEN 0
           WHEN 'like' THEN 0
           WHEN 'super_like' THEN 0
           WHEN 'pass' THEN 0
           WHEN 'match' THEN 1
           WHEN 'profile' THEN 2
           WHEN 'preference' THEN 3
           ELSE 4
         END,
         created_at ASC
       LIMIT ?`,
      [limit],
    );
  }

  static async markSynced(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      "UPDATE local_sync_outbox SET status = 'synced' WHERE id = ?",
      [id],
    );
  }

  static async markFailed(id: number, retryCount: number): Promise<void> {
    const db = await getDatabase();
    if (retryCount >= 5) {
      await db.runAsync(
        "UPDATE local_sync_outbox SET status = 'failed', retry_count = ?, last_retry_at = ? WHERE id = ?",
        [retryCount, Date.now(), id],
      );
    } else {
      await db.runAsync(
        "UPDATE local_sync_outbox SET status = 'pending', retry_count = ?, last_retry_at = ? WHERE id = ?",
        [retryCount, Date.now(), id],
      );
    }
  }

  static async markMessageSynced(localId: string, serverId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE local_messages SET is_sent = 1, sent_at = ? WHERE id = ?',
      [Date.now(), localId],
    );
    await db.runAsync(
      `INSERT OR REPLACE INTO id_mappings (local_id, server_id, entity_type, synced_at)
       VALUES (?, ?, 'message', datetime('now'))`,
      [localId, serverId],
    );
  }

  static async getRetryDelay(attempt: number): Promise<number> {
    const baseDelay = 1000;
    const maxDelay = 300000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    return delay + Math.random() * 1000;
  }
}

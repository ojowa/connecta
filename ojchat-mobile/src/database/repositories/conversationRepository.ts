import { getDatabase } from '../connection';

export class ConversationRepository {
  static async getAll(): Promise<any[]> {
    const db = await getDatabase();
    return db.getAllAsync(
      `SELECT c.*, cp.user_id as participant_id
       FROM conversations c
       LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
       ORDER BY c.last_message_at DESC`
    );
  }

  static async getById(id: string): Promise<any> {
    const db = await getDatabase();
    return db.getFirstAsync('SELECT * FROM conversations WHERE id = ?', [id]);
  }

  static async upsert(data: { id: string; lastMessageId?: string; lastMessageAt?: string }): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO conversations (id, last_message_id, last_message_at)
       VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         last_message_id = excluded.last_message_id,
         last_message_at = excluded.last_message_at`,
      [data.id, data.lastMessageId || null, data.lastMessageAt || null]
    );
  }

  static async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM conversations WHERE id = ?', [id]);
  }
}

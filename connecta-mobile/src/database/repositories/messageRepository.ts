import { getDatabase } from '../connection';
import { Message } from '../../types/chat';

export class MessageRepository {
  static async getByConversation(conversationId: string, limit = 50, offset = 0): Promise<any[]> {
    const db = await getDatabase();
    return db.getAllAsync(
      `SELECT m.*, u.display_name as sender_name
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [conversationId, limit, offset]
    );
  }

  static async insert(message: { id: string; conversationId: string; senderId: string; content: string; type: string }): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO messages (id, conversation_id, sender_id, content, type, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [message.id, message.conversationId, message.senderId, message.content, message.type]
    );
  }

  static async updateStatus(id: string, status: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('UPDATE messages SET status = ? WHERE id = ?', [status, id]);
  }

  static async getPending(): Promise<any[]> {
    const db = await getDatabase();
    return db.getAllAsync("SELECT * FROM messages WHERE status = 'pending' ORDER BY created_at ASC");
  }

  static async markAsRead(conversationId: string, readAt: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      "UPDATE messages SET status = 'read' WHERE conversation_id = ? AND status != 'read'",
      [conversationId]
    );
  }

  static async softDelete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("UPDATE messages SET content = '', status = 'deleted' WHERE id = ?", [id]);
  }
}

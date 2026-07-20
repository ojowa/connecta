import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { getDatabase } from '../database/connection';
import { Outbox, SyncOperation } from './Outbox';
import { ConflictResolver, STRATEGY_MATRIX } from './strategies/conflictResolution';
import { NetworkManager } from './NetworkManager';
import { apiClient } from '../services/api/apiClient';

export interface SyncConfig {
  maxRetries: number;
  batchSize: number;
  syncIntervalMs: number;
  pullIntervalMs: number;
}

const DEFAULT_CONFIG: SyncConfig = {
  maxRetries: 5,
  batchSize: 50,
  syncIntervalMs: 30000,
  pullIntervalMs: 300000,
};

export class SyncEngine {
  private static instance: SyncEngine;
  private isSyncing = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private pullInterval: ReturnType<typeof setInterval> | null = null;
  private conflictResolver = new ConflictResolver();
  private config: SyncConfig;

  private constructor(config?: Partial<SyncConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static getInstance(config?: Partial<SyncConfig>): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine(config);
    }
    return SyncEngine.instance;
  }

  async initialize(): Promise<void> {
    NetworkManager.init();
    this.setupListeners();
    this.startPeriodicSync();
  }

  private setupListeners(): void {
    AppState.addEventListener('change', this.handleAppState);
    NetInfo.addEventListener((info) => {
      if (info.isConnected) {
        this.triggerSync();
      }
    });
  }

  private handleAppState = (state: AppStateStatus): void => {
    if (state === 'active') {
      this.triggerSync();
    } else if (state === 'background') {
      this.scheduleBackgroundSync();
    }
  };

  private startPeriodicSync(): void {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = setInterval(() => {
      if (NetworkManager.isConnected()) {
        this.triggerSync();
      }
    }, this.config.syncIntervalMs);

    if (this.pullInterval) clearInterval(this.pullInterval);
    this.pullInterval = setInterval(() => {
      if (NetworkManager.isConnected()) {
        this.pullUpdates();
      }
    }, this.config.pullIntervalMs);
  }

  private scheduleBackgroundSync(): void {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = setInterval(() => {
      if (NetworkManager.isConnected()) {
        this.triggerSync();
      }
    }, 30000);
  }

  async triggerSync(): Promise<void> {
    if (this.isSyncing || !NetworkManager.isConnected()) return;
    this.isSyncing = true;

    try {
      await this.processOutbox();
      await this.pullUpdates();
      await this.cleanupCompletedItems();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async processOutbox(): Promise<void> {
    const pending = await Outbox.getPending(this.config.batchSize);

    for (const item of pending) {
      try {
        await this.syncItem(item);
        await Outbox.markSynced(item.id);
      } catch (error: any) {
        const retryCount = (item.retry_count || 0) + 1;
        if (retryCount >= this.config.maxRetries) {
          console.error(`Sync item ${item.id} failed after ${retryCount} attempts:`, error.message);
        }
        await Outbox.markFailed(item.id, retryCount);
      }
    }
  }

  private async syncItem(item: any): Promise<void> {
    const { operation, entity_type, entity_id, payload } = item;
    const data = payload ? JSON.parse(payload) : {};

    switch (`${operation}:${entity_type}`) {
      case 'CREATE:message':
        const msgResult = await apiClient.post('/chat/messages', data);
        if (msgResult.data?.messageId) {
          await Outbox.markMessageSynced(entity_id, msgResult.data.messageId);
        }
        break;

      case 'UPDATE:profile':
        await apiClient.put('/users/me', data);
        break;

      case 'UPDATE:preference':
        await apiClient.put('/users/preferences', data);
        break;

      case 'CREATE:like':
        await apiClient.post('/match/like', { targetUserId: entity_id });
        break;

      case 'CREATE:pass':
        await apiClient.post('/match/pass', { targetUserId: entity_id });
        break;

      case 'CREATE:super_like':
        await apiClient.post('/match/super-like', { targetUserId: entity_id });
        break;

      case 'CREATE:message_reaction':
        await apiClient.post(`/chat/messages/${entity_id}/reactions`, data);
        break;

      case 'DELETE:message':
        await apiClient.delete(`/chat/messages/${entity_id}`);
        break;

      case 'UPDATE:message_read':
        await apiClient.post('/chat/mark-read', data);
        break;

      default:
        break;
    }
  }

  private async pullUpdates(): Promise<void> {
    const lastSync = await this.getLastSyncTimestamp();

    try {
      const [messagesRes, matchesRes, profileRes] = await Promise.all([
        apiClient.get(`/chat/sync?since=${lastSync}`).catch(() => ({ data: [] })),
        apiClient.get(`/match/sync?since=${lastSync}`).catch(() => ({ data: [] })),
        apiClient.get(`/users/sync?since=${lastSync}`).catch(() => ({ data: null })),
      ]);

      for (const msg of messagesRes.data || []) {
        await this.saveIncomingMessage(msg);
      }

      for (const match of matchesRes.data || []) {
        await this.saveIncomingMatch(match);
      }

      if (profileRes.data) {
        await this.saveIncomingProfile(profileRes.data);
      }

      await this.setLastSyncTimestamp(Date.now());
    } catch (error) {
      console.error('Pull updates failed:', error);
    }
  }

  private async saveIncomingMessage(msg: any): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();

    await db.runAsync(
      `INSERT OR REPLACE INTO local_messages
       (id, conversation_id, sender_id, content, content_type, media_url, reply_to_id, is_sent, is_read, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      [
        msg.id,
        msg.conversationId,
        msg.senderId,
        msg.content,
        msg.type || 'text',
        msg.mediaUrl || null,
        msg.replyToId || null,
        msg.isRead ? 1 : 0,
        new Date(msg.createdAt).getTime(),
        now,
      ],
    );

    if (msg.conversationId) {
      await db.runAsync(
        `INSERT OR REPLACE INTO local_conversations (id, last_message, last_message_at, updated_at)
         VALUES (?, ?, ?, ?)`,
        [msg.conversationId, msg.content, new Date(msg.createdAt).getTime(), now],
      );
    }
  }

  private async saveIncomingMatch(match: any): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();

    await db.runAsync(
      `INSERT OR REPLACE INTO local_conversations
       (id, match_id, other_user_id, other_user_name, other_user_photo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        match.conversationId || match.id,
        match.id,
        match.otherUserId,
        match.otherUserName || null,
        match.otherUserPhoto || null,
        new Date(match.matchedAt || match.createdAt).getTime(),
        now,
      ],
    );
  }

  private async saveIncomingProfile(profile: any): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();

    const existing = await db.getFirstAsync<{ version: number }>(
      'SELECT version FROM local_profile_cache WHERE user_id = ?',
      [profile.userId],
    );
    const version = existing ? existing.version + 1 : 1;

    await db.runAsync(
      `INSERT OR REPLACE INTO local_profile_cache (user_id, data, version, cached_at)
       VALUES (?, ?, ?, ?)`,
      [profile.userId, JSON.stringify(profile), version, now],
    );
  }

  private async getLastSyncTimestamp(): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM sync_metadata WHERE key = 'last_sync_timestamp'",
    );
    return row ? parseInt(row.value, 10) : 0;
  }

  private async setLastSyncTimestamp(timestamp: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
       VALUES ('last_sync_timestamp', ?, ?)`,
      [String(timestamp), Date.now()],
    );
  }

  private async cleanupCompletedItems(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      "DELETE FROM local_sync_outbox WHERE status = 'synced' AND created_at < ?",
      [Date.now() - 86400000],
    );
  }

  enqueue(operation: SyncOperation): void {
    Outbox.enqueue(operation);
  }

  getConflictResolver(): ConflictResolver {
    return this.conflictResolver;
  }

  destroy(): void {
    if (this.syncInterval) clearInterval(this.syncInterval);
    if (this.pullInterval) clearInterval(this.pullInterval);
  }
}

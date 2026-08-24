import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { getDatabase } from '../database/connection';
import { Outbox, SyncOperation } from './Outbox';
import { ConflictResolver, STRATEGY_MATRIX } from './strategies/conflictResolution';
import { NetworkManager } from './NetworkManager';
import { apiClient } from '../services/api/apiClient';
import { FeedCacheRepository } from '../database/repositories/feedCacheRepository';
import { VectorClock } from './VectorClock';

export interface SyncConfig {
  maxRetries: number;
  batchSize: number;
  syncIntervalMs: number;
  pullIntervalMs: number;
  feedCacheMaxAgeMs: number;
  messageRetentionDays: number;
}

const DEFAULT_CONFIG: SyncConfig = {
  maxRetries: 5,
  batchSize: 50,
  syncIntervalMs: 30000,
  pullIntervalMs: 300000,
  feedCacheMaxAgeMs: 86400000,
  messageRetentionDays: 90,
};

export class SyncEngine {
  private static instance: SyncEngine;
  private isSyncing = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private pullInterval: ReturnType<typeof setInterval> | null = null;
  private conflictResolver = new ConflictResolver();
  private config: SyncConfig;
  private localVectorClock: VectorClock | null = null;
  private appStateSubscription: any = null;
  private netInfoUnsubscribe: (() => void) | null = null;

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
    await getDatabase();
    NetworkManager.init();
    this.localVectorClock = await this.loadVectorClock();
    this.setupListeners();
    this.startPeriodicSync();
  }

  private setupListeners(): void {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppState);
    this.netInfoUnsubscribe = NetInfo.addEventListener((info) => {
      if (info.isConnected) {
        this.triggerSync();
      }
    });
  }

  private handleAppState = (state: AppStateStatus): void => {
    if (state === 'active') {
      this.triggerSync();
    } else if (state === 'background') {
      this.runBackgroundTasks();
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

  private async runBackgroundTasks(): Promise<void> {
    if (this.syncInterval) clearInterval(this.syncInterval);

    await this.checkpointDatabase();
    await FeedCacheRepository.clearExpired(this.config.feedCacheMaxAgeMs);
    await Outbox.cleanupFailed();
    await this.cleanupOldMessages();

    this.syncInterval = setInterval(async () => {
      if (NetworkManager.isConnected()) {
        try {
          await this.processOutbox();
        } catch (e) {
          console.error('Background outbox sync failed:', e);
        }
      }
    }, 60000);
  }

  private async checkpointDatabase(): Promise<void> {
    try {
      const db = await getDatabase();
      await db.execAsync('PRAGMA wal_checkpoint(TRUNCATE);');
    } catch (e) {
      console.error('WAL checkpoint failed:', e);
    }
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
    const now = Date.now();

    for (const item of pending) {
      const secondsUntilRetry = await Outbox.getSecondsUntilRetry(item);
      if (secondsUntilRetry > 0) {
        continue;
      }

      try {
        await this.syncItem(item);
        await Outbox.markSynced(item.id);
      } catch (error: any) {
        const retryCount = (item.retry_count || 0) + 1;
        if (retryCount >= this.config.maxRetries) {
          console.error(`Sync item ${item.id} failed permanently after ${retryCount} attempts:`, error.message);
        }
        await Outbox.markFailed(item.id, retryCount);
      }
    }
  }

  private async syncItem(item: any): Promise<void> {
    const { operation, entity_type, entity_id, payload } = item;
    const data = payload ? JSON.parse(payload) : {};

    switch (`${operation}:${entity_type}`) {
      case 'CREATE:message': {
        const conversationId = data.conversationId;
        if (!conversationId) break;
        const msgResult = await apiClient.post(`/chat/conversations/${conversationId}/messages`, data);
        if (msgResult.data?.data?.id) {
          await Outbox.markMessageSynced(entity_id, msgResult.data.data.id);
        }
        break;
      }
      case 'UPDATE:profile':
        await apiClient.patch('/users/me', data);
        break;
      case 'UPDATE:preference':
        await apiClient.put('/users/me/preferences', data);
        break;
      case 'CREATE:like':
        await apiClient.post(`/matching/like/${entity_id}`);
        break;
      case 'CREATE:pass':
        await apiClient.post(`/matching/pass/${entity_id}`);
        break;
      case 'CREATE:super_like':
        await apiClient.post(`/matching/superlike/${entity_id}`);
        break;
      case 'CREATE:message_reaction': {
        const convId = data.conversationId;
        if (!convId) break;
        await apiClient.post(`/chat/conversations/${convId}/messages/${entity_id}/reactions`, { emoji: data.emoji });
        break;
      }
      case 'DELETE:message': {
        const convId = data.conversationId;
        if (!convId) break;
        await apiClient.delete(`/chat/conversations/${convId}/messages/${entity_id}`);
        break;
      }
      case 'UPDATE:message_read': {
        const convId = data.conversationId;
        if (!convId) break;
        await apiClient.put(`/chat/conversations/${convId}/read`);
        break;
      }
      default:
        break;
    }
  }

  private async pullUpdates(): Promise<void> {
    const lastSync = await this.getLastSyncTimestamp();
    let latestSync = lastSync;

    try {
      const [messagesRes, matchesRes, profileRes] = await Promise.all([
        apiClient.get(`/chat/sync?since=${lastSync}`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/matching/sync?since=${lastSync}`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/users/sync?since=${lastSync}`).catch(() => ({ data: { data: null } })),
      ]);

      const msgData = messagesRes.data?.data ?? messagesRes.data;
      const matchData = matchesRes.data?.data ?? matchesRes.data;
      const profileData = profileRes.data?.data ?? profileRes.data;

      const messages = Array.isArray(msgData) ? msgData : [];
      const matches = Array.isArray(matchData) ? matchData : [];
      const profile = profileData && typeof profileData === 'object' ? profileData : null;

      for (const msg of messages) {
        await this.saveIncomingMessage(msg);
        const msgTime = new Date(msg.createdAt).getTime();
        if (msgTime > latestSync) latestSync = msgTime;
      }

      for (const match of matches) {
        await this.saveIncomingMatch(match);
        const matchTime = new Date(match.matchedAt || match.createdAt).getTime();
        if (matchTime > latestSync) latestSync = matchTime;
      }

      if (profile) {
        await this.saveIncomingProfile(profile);
        const profileTime = profile.updatedAt ? new Date(profile.updatedAt).getTime() : Date.now();
        if (profileTime > latestSync) latestSync = profileTime;
      }

      if (latestSync > lastSync) {
        await this.setLastSyncTimestamp(latestSync);
      }
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

    const otherUser = match.otherUser || {};
    await db.runAsync(
      `INSERT OR REPLACE INTO local_conversations
       (id, match_id, other_user_id, other_user_name, other_user_photo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        match.conversationId || match.id,
        match.id,
        otherUser.id || match.otherUserId || null,
        otherUser.fullName || match.otherUserName || null,
        otherUser.avatarUrl || match.otherUserPhoto || null,
        new Date(match.matchedAt || match.createdAt).getTime(),
        now,
      ],
    );
  }

  private async saveIncomingProfile(profile: any): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();

    const existing = await db.getFirstAsync<{ data: string; version: number }>(
      'SELECT data, version FROM local_profile_cache WHERE user_id = ?',
      [profile.userId],
    );

    if (existing) {
      const localData = JSON.parse(existing.data);
      const remoteUpdated = profile.updatedAt ? new Date(profile.updatedAt).getTime() : 0;
      const localUpdated = localData.updatedAt || 0;

      if (remoteUpdated <= localUpdated) return;

      const strategy = this.conflictResolver.getStrategyForEntity('profile');
      const resolved = this.conflictResolver.resolve(
        { ...localData, updatedAt: localUpdated, vectorClock: localData.vectorClock },
        { ...profile, updatedAt: remoteUpdated, vectorClock: profile.vectorClock },
        strategy,
      );
      await db.runAsync(
        `INSERT OR REPLACE INTO local_profile_cache (user_id, data, version, cached_at)
         VALUES (?, ?, ?, ?)`,
        [profile.userId, JSON.stringify(resolved), existing.version + 1, now],
      );
    } else {
      await db.runAsync(
        `INSERT OR REPLACE INTO local_profile_cache (user_id, data, version, cached_at)
         VALUES (?, ?, ?, ?)`,
        [profile.userId, JSON.stringify(profile), 1, now],
      );
    }
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

  private async cleanupOldMessages(): Promise<void> {
    const db = await getDatabase();
    const cutoff = Date.now() - this.config.messageRetentionDays * 86400000;
    await db.runAsync(
      'DELETE FROM local_messages WHERE created_at < ? AND is_sent = 1',
      [cutoff],
    );
  }

  private async loadVectorClock(): Promise<VectorClock> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM sync_metadata WHERE key = 'vector_clock'",
    );
    if (row) {
      return new VectorClock(row.value);
    }

    try {
      const response = await apiClient.get('/sync/vector-clock');
      const vc = response.data?.data?.vectorClock || response.data?.vectorClock;
      if (vc) {
        const clock = new VectorClock(vc);
        await this.saveVectorClock(clock);
        return clock;
      }
    } catch (e) {
      console.error('Failed to fetch server vector clock:', e);
    }

    return new VectorClock();
  }

  private async saveVectorClock(clock: VectorClock): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
       VALUES ('vector_clock', ?, ?)`,
      [clock.serialize(), Date.now()],
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
    if (this.appStateSubscription) this.appStateSubscription.remove();
    if (this.netInfoUnsubscribe) this.netInfoUnsubscribe();
  }
}

import { SyncEngine } from './SyncEngine';
import { NetworkManager } from './NetworkManager';
import { FeedCacheRepository } from '../database/repositories/feedCacheRepository';
import { Outbox } from './Outbox';

let backgroundSyncInterval: ReturnType<typeof setInterval> | null = null;

export async function registerBackgroundSync(): Promise<void> {
  if (backgroundSyncInterval) return;

  const syncEngine = SyncEngine.getInstance();

  backgroundSyncInterval = setInterval(async () => {
    if (!NetworkManager.isConnected()) return;
    try {
      await syncEngine.triggerSync();
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }, 60000);
}

export function unregisterBackgroundSync(): void {
  if (backgroundSyncInterval) {
    clearInterval(backgroundSyncInterval);
    backgroundSyncInterval = null;
  }
}

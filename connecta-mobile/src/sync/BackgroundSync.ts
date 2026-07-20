import { SyncEngine } from './SyncEngine';

let backgroundSyncInterval: ReturnType<typeof setInterval> | null = null;

export function registerBackgroundSync(): void {
  if (backgroundSyncInterval) return;

  const syncEngine = SyncEngine.getInstance();

  backgroundSyncInterval = setInterval(async () => {
    try {
      await syncEngine.triggerSync();
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }, 900000);
}

export function unregisterBackgroundSync(): void {
  if (backgroundSyncInterval) {
    clearInterval(backgroundSyncInterval);
    backgroundSyncInterval = null;
  }
}

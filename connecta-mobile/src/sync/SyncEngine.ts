import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAppStore } from '../store';
import { SyncQueueRepository } from '../database/repositories/syncQueueRepository';
import { apiClient } from '../services/api/apiClient';
import { v4 as uuid } from 'uuid';

class SyncEngine {
  private static instance: SyncEngine;
  private isRunning = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  static getInstance(): SyncEngine {
    if (!SyncEngine.instance) SyncEngine.instance = new SyncEngine();
    return SyncEngine.instance;
  }

  private constructor() {
    this.setupListeners();
  }

  private setupListeners(): void {
    AppState.addEventListener('change', this.handleAppState);
    NetInfo.addEventListener((info) => {
      useAppStore.getState().setOnline(info.isConnected ?? false);
      if (info.isConnected) this.startSync();
    });
  }

  private handleAppState = (state: AppStateStatus): void => {
    if (state === 'active') this.startSync();
    else if (state === 'background') this.scheduleBackgroundSync();
  };

  async startSync(): Promise<void> {
    if (this.isRunning || !useAppStore.getState().isOnline) return;
    this.isRunning = true;
    try {
      const pending = await SyncQueueRepository.getPending();
      for (const action of pending) {
        try {
          await SyncQueueRepository.markProcessing(action.id);
          await this.executeAction(action);
          await SyncQueueRepository.markCompleted(action.id);
        } catch (error: any) {
          await SyncQueueRepository.markFailed(action.id, String(error), (action.retry_count || 0) + 1);
        }
      }
    } finally {
      this.isRunning = false;
    }
  }

  enqueue(type: string, payload: unknown): void {
    SyncQueueRepository.enqueue({
      id: uuid(),
      type,
      payload: JSON.stringify(payload),
      priority: type === 'CREATE_MESSAGE' ? 0 : 1,
    });
    if (useAppStore.getState().isOnline) this.startSync();
  }

  private async executeAction(action: any): Promise<void> {
    const payload = JSON.parse(action.payload);
    switch (action.type) {
      case 'CREATE_MESSAGE':
        await apiClient.post(`/chat/conversations/${payload.conversationId}/messages`, payload);
        break;
      case 'UPDATE_PROFILE':
        await apiClient.put('/users/me', payload);
        break;
      case 'UPLOAD_MEDIA':
        await apiClient.post('/media/upload', payload);
        break;
      default:
        break;
    }
  }

  private scheduleBackgroundSync(): void {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = setInterval(() => {
      if (useAppStore.getState().isOnline) this.startSync();
    }, 30000);
  }
}

export default SyncEngine;

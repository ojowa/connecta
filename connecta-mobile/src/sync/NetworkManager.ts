import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { SyncEngine } from './SyncEngine';

type ConnectivityListener = (connected: boolean) => void;

export class NetworkManager {
  private static connected = false;
  private static connectionType = 'unknown';
  private static listeners: ConnectivityListener[] = [];

  static init(): void {
    NetInfo.addEventListener((state: NetInfoState) => {
      const wasConnected = this.connected;
      this.connected = !!(state.isConnected && state.isInternetReachable);
      this.connectionType = state.type;

      if (!wasConnected && this.connected) {
        SyncEngine.getInstance().triggerSync();
      }

      this.listeners.forEach((l) => l(this.connected));
    });
  }

  static isConnected(): boolean {
    return this.connected;
  }

  static getConnectionType(): string {
    return this.connectionType;
  }

  static onConnectivityChange(listener: ConnectivityListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  static isOnWifi(): boolean {
    return this.connectionType === 'wifi';
  }

  static isOnCellular(): boolean {
    return this.connectionType === 'cellular';
  }

  static canUploadLargeFiles(): boolean {
    return this.connectionType === 'wifi' || this.connectionType === 'ethernet';
  }

  static canUploadSmallFiles(): boolean {
    return this.connected && this.connectionType !== 'none';
  }
}

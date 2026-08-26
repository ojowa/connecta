import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type ConnectivityListener = (connected: boolean) => void;

export class NetworkManager {
  private static connected = false;
  private static connectionType = 'unknown';
  private static details: NetInfoState['details'] = null;
  private static listeners: ConnectivityListener[] = [];

  static init(): void {
    NetInfo.addEventListener((state: NetInfoState) => {
      const wasConnected = this.connected;
      this.connected = !!(state.isConnected && state.isInternetReachable);
      this.connectionType = state.type;
      this.details = state.details;

      if (!wasConnected && this.connected) {
        import('./SyncEngine').then(({ SyncEngine }) => {
          SyncEngine.getInstance().triggerSync();
        });
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

  static getDetails(): NetInfoState['details'] {
    return this.details;
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

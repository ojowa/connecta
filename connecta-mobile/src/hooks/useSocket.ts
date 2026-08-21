import { useEffect, useCallback, useRef } from 'react';
import SocketManager from '../socket/SocketManager';
import { useAppStore } from '../store';

export function useSocket() {
  const socketManager = useRef(SocketManager.getInstance());
  const { isAuthenticated, token } = useAppStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      socketManager.current.connect();
    }
    return () => socketManager.current.disconnect();
  }, [isAuthenticated, token]);

  const emit = useCallback((event: string, data?: unknown) => {
    socketManager.current.emit(event, data);
  }, []);

  return {
    socket: socketManager.current,
    emit,
    isConnected: socketManager.current.isConnected,
    isCallsConnected: socketManager.current.isCallsConnected,
  };
}

import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppStore } from '../store';

export function useNetworkStatus() {
  const setOnline = useAppStore((s) => s.setOnline);
  const isOnline = useAppStore((s) => s.isOnline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, [setOnline]);

  return isOnline;
}

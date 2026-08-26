import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '../navigation/RootNavigator';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { ToastProvider } from '../components/common/Toast';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useNotifications } from '../hooks/useNotifications';
import { useSocket } from '../hooks/useSocket';
import { SyncEngine } from '../sync/SyncEngine';
import { useAppStore } from '../store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, gcTime: 30 * 60 * 1000, retry: 3, refetchOnReconnect: true },
  },
});

const AppInner: React.FC = () => {
  useNetworkStatus();
  useNotifications();
  useSocket();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  React.useEffect(() => {
    if (isAuthenticated) {
      SyncEngine.getInstance().initialize().catch(() => {});
    } else {
      SyncEngine.getInstance().destroy();
    }
  }, [isAuthenticated]);
  return (
    <>
      <OfflineBanner />
      <RootNavigator />
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <AppInner />
            </ToastProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

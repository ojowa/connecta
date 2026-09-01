import React from 'react';
import * as Sentry from '@sentry/react-native';
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
import { useAppStore, bindQueryClient } from '../store';
import { initMMKV } from '../services/storage/mmkvStorage';
import { logger } from '../utils/logger';

if (!__DEV__) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.2,
    environment: __DEV__ ? 'development' : 'production',
  });
}

initMMKV();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 3,
      refetchOnReconnect: true,
      throwOnError: (error) => !__DEV__ && Boolean(error),
    },
    mutations: {
      onError: (error) => {
        logger.error('Mutation error', {
          message: error instanceof Error ? error.message : String(error),
        });
        Sentry.captureException(error);
      },
    },
  },
});

bindQueryClient(queryClient);

const AppInner: React.FC = () => {
  useNetworkStatus();
  useNotifications();
  useSocket();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  React.useEffect(() => {
    if (isAuthenticated) {
      SyncEngine.getInstance()
        .initialize()
        .catch((err) =>
          logger.error('SyncEngine init failed', {
            message: err instanceof Error ? err.message : String(err),
          }),
        );
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

export default Sentry.wrap(function App() {
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
});

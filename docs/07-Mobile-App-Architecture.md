# Mobile App Architecture Document

**Project:** OJChat Dating App
**Version:** 1.0.0
**Date:** July 2026
**Platform:** iOS & Android

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Folder Structure](#2-folder-structure)
3. [State Management](#3-state-management)
4. [Navigation Architecture](#4-navigation-architecture)
5. [Offline-First SQLite Setup](#5-offline-first-sqlite-setup)
6. [Background Sync Engine](#6-background-sync-engine)
7. [Socket.IO Client Setup](#7-socketio-client-setup)
8. [WebRTC Client Setup](#8-webrtc-client-setup)
9. [Push Notification Handling](#9-push-notification-handling)
10. [Biometric Authentication](#10-biometric-authentication)
11. [Image Handling](#11-image-handling)
12. [Key Libraries](#12-key-libraries)
13. [Error Handling Strategy](#13-error-handling-strategy)
14. [Performance Optimization](#14-performance-optimization)
15. [Testing Approach](#15-testing-approach)

---

## 1. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native | 0.86 |
| Build Tool | Expo | SDK 57 |
| Language | TypeScript | 5.5+ |
| Navigation | React Navigation | 7.x |
| State Management | Zustand | 5.x |
| Database | SQLite (via expo-sqlite) | 14.x |
| Encryption | SQLCipher | 4.x |
| Real-time | Socket.IO Client | 4.x |
| WebRTC | react-native-webrtc | 124+ |
| Push Notifications | expo-notifications | 0.29+ |
| Biometrics | expo-local-authentication | 14.x |
| Animations | react-native-reanimated | 3.x |
| Gestures | react-native-gesture-handler | 2.x |
| HTTP Client | ky or axios | latest |
| Local Storage | react-native-mmkv | 3.x |
| Image Handling | expo-image-manipulator + expo-image-picker | 13.x |
| Testing | Jest + React Native Testing Library | 29.x |
| E2E Testing | Detox | 20.x |

### Expo Managed Workflow Benefits

- Over-the-air (OTA) updates via `expo-updates`
- Built-in builds via EAS Build
- Pre-configured native modules
- Simplified environment variable management
- Flat file-based navigation with React Navigation 7

---

## 2. Folder Structure

```
ojchat-mobile/
|-- app.json
|-- App.tsx
|-- babel.config.js
|-- metro.config.js
|-- tsconfig.json
|-- eas.json
|-- .env
|-- .env.production
|
|-- assets/
|   |-- fonts/
|   |-- images/
|   |   |-- logo.png
|   |   |-- onboarding/
|   |   +-- placeholders/
|   +-- animations/
|       |-- like.json
|       |-- match.json
|       +-- loading.json
|
+-- src/
    |-- components/
    |   |-- common/
    |   |   |-- Avatar.tsx
    |   |   |-- Button.tsx
    |   |   |-- Card.tsx
    |   |   |-- Checkbox.tsx
    |   |   |-- EmptyState.tsx
    |   |   |-- ErrorBoundary.tsx
    |   |   |-- Icon.tsx
    |   |   |-- Input.tsx
    |   |   |-- LoadingSpinner.tsx
    |   |   |-- Modal.tsx
    |   |   |-- SafeAreaView.tsx
    |   |   |-- Text.tsx
    |   |   +-- TouchableOpacity.tsx
    |   |
    |   |-- chat/
    |   |   |-- ChatBubble.tsx
    |   |   |-- ChatInput.tsx
    |   |   |-- ChatList.tsx
    |   |   |-- ConversationItem.tsx
    |   |   |-- MediaPreview.tsx
    |   |   |-- MessageStatus.tsx
    |   |   |-- TypingIndicator.tsx
    |   |   +-- VoiceMessage.tsx
    |   |
    |   |-- dating/
    |   |   |-- CompatibilityScore.tsx
    |   |   |-- DistanceBadge.tsx
    |   |   |-- InterestTag.tsx
    |   |   |-- MatchCard.tsx
    |   |   |-- ProfileCard.tsx
    |   |   |-- ProfilePhotoGrid.tsx
    |   |   |-- SwipeableCard.tsx
    |   |   +-- VerifiedBadge.tsx
    |   |
    |   |-- media/
    |   |   |-- Camera.tsx
    |   |   |-- ImageCropper.tsx
    |   |   |-- ImageGallery.tsx
    |   |   |-- ImagePicker.tsx
    |   |   |-- MediaViewer.tsx
    |   |   |-- StoryCircle.tsx
    |   |   |-- StoryViewer.tsx
    |   |   +-- VideoPlayer.tsx
    |   |
    |   |-- call/
    |   |   |-- CallControls.tsx
    |   |   |-- CallOverlay.tsx
    |   |   |-- CallTimer.tsx
    |   |   |-- IncomingCallModal.tsx
    |   |   +-- VideoCallView.tsx
    |   |
    |   +-- profile/
    |       |-- InterestSelector.tsx
    |       |-- PhotoUpload.tsx
    |       |-- ProfileCompletionBar.tsx
    |       +-- PreferenceSlider.tsx
    |
    |-- screens/
    |   |-- onboarding/
    |   |   |-- SplashScreen.tsx
    |   |   |-- WelcomeScreen.tsx
    |   |   +-- OnboardingFlow.tsx
    |   |
    |   |-- auth/
    |   |   |-- LoginScreen.tsx
    |   |   |-- RegisterScreen.tsx
    |   |   |-- OTPVerificationScreen.tsx
    |   |   |-- ForgotPasswordScreen.tsx
    |   |   +-- BiometricSetupScreen.tsx
    |   |
    |   |-- main/
    |   |   |-- DiscoverScreen.tsx
    |   |   |-- MatchesScreen.tsx
    |   |   |-- ChatsScreen.tsx
    |   |   +-- ProfileScreen.tsx
    |   |
    |   |-- chat/
    |   |   +-- ConversationScreen.tsx
    |   |
    |   |-- profile/
    |   |   |-- EditProfileScreen.tsx
    |   |   +-- PhotoManagerScreen.tsx
    |   |
    |   |-- settings/
    |   |   +-- SettingsScreen.tsx
    |   |
    |   |-- notifications/
    |   |   +-- NotificationsScreen.tsx
    |   |
    |   |-- subscription/
    |   |   |-- SubscriptionScreen.tsx
    |   |   +-- WalletScreen.tsx
    |   |
    |   |-- safety/
    |   |   |-- ReportScreen.tsx
    |   |   |-- BlockConfirmation.tsx
    |   |   +-- SafetyTips.tsx
    |   |
    |   |-- call/
    |   |   |-- IncomingCallScreen.tsx
    |   |   |-- ActiveVoiceCallScreen.tsx
    |   |   +-- ActiveVideoCallScreen.tsx
    |   |
    |   +-- match/
    |       +-- MatchScreen.tsx
    |
    |-- navigation/
    |   |-- RootNavigator.tsx              # Auth/Main switch + push/modal screens
    |   |-- AuthNavigator.tsx              # Auth flow: Splash → Welcome → Onboarding → Login → Register → OTP → ForgotPassword
    |   +-- MainTabNavigator.tsx           # 4 tabs: Discover | Matches | Chats | Profile
    |
    |-- services/
    |   |-- api/
    |   |   |-- apiClient.ts                 # Axios/fetch instance
    |   |   |-- authApi.ts
    |   |   |-- chatApi.ts
    |   |   |-- matchApi.ts
    |   |   |-- profileApi.ts
    |   |   |-- mediaApi.ts
    |   |   +-- notificationApi.ts
    |   |
    |   |-- storage/
    |   |   |-- secureStorage.ts             # Keychain/Keystore
    |   |   |-- mmkvStorage.ts               # MMKV wrapper
    |   |   +-- fileSystem.ts                # Expo FileSystem wrapper
    |   |
    |   +-- analytics/
    |       |-- eventTracker.ts
    |       +-- crashReporter.ts
    |
    |-- hooks/
    |   |-- useAuth.ts
    |   |-- useCamera.ts
    |   |-- useChat.ts
    |   |-- useConversation.ts
    |   |-- useDebounce.ts
    |   |-- useDeviceOrientation.ts
    |   |-- useImagePicker.ts
    |   |-- useLocation.ts
    |   |-- useMatch.ts
    |   |-- useNetworkStatus.ts
    |   |-- useNotifications.ts
    |   |-- usePermissions.ts
    |   |-- useSocket.ts
    |   |-- useSwipe.ts
    |   |-- useWebRTC.ts
    |   +-- useAnimatedValue.ts
    |
    |-- database/
    |   |-- connection.ts                    # SQLCipher connection setup
    |   |-- migrations/
    |   |   |-- index.ts
    |   |   |-- 001_initial.ts
    |   |   |-- 002_messages.ts
    |   |   |-- 003_media.ts
    |   |   +-- 004_sync_metadata.ts
    |   |-- models/
    |   |   |-- User.ts
    |   |   |-- Message.ts
    |   |   |-- Conversation.ts
    |   |   |-- Match.ts
    |   |   |-- Media.ts
    |   |   +-- SyncQueue.ts
    |   |-- repositories/
    |   |   |-- userRepository.ts
    |   |   |-- messageRepository.ts
    |   |   |-- conversationRepository.ts
    |   |   |-- matchRepository.ts
    |   |   |-- mediaRepository.ts
    |   |   +-- syncQueueRepository.ts
    |   +-- seeders/
    |       +-- devSeeder.ts
    |
    |-- socket/
    |   |-- SocketManager.ts                 # Socket.IO connection manager
    |   |-- eventHandlers/
    |   |   |-- messageHandler.ts
    |   |   |-- typingHandler.ts
    |   |   |-- presenceHandler.ts
    |   |   |-- matchHandler.ts
    |   |   |-- callHandler.ts
    |   |   +-- notificationHandler.ts
    |   |-- middleware/
    |   |   |-- authMiddleware.ts            # Token injection
    |   |   +-- reconnectMiddleware.ts       # Auto-reconnect logic
    |   +-- events.ts                        # Event name constants
    |
    |-- webrtc/
    |   |-- WebRTCManager.ts                # WebRTC peer connection manager
    |   |-- signaling/
    |   |   |-- signalingClient.ts           # Signaling via Socket.IO
    |   |   +-- iceServerConfig.ts
    |   +-- utils/
    |       |-- mediaUtils.ts
    |       +-- callQuality.ts
    |
    |-- sync/
    |   |-- SyncEngine.ts                   # Core sync orchestrator
    |   |-- strategies/
    |   |   |-- fullSync.ts
    |   |   |-- incrementalSync.ts
    |   |   +-- conflictResolution.ts       # CRDT/last-write-wins
    |   |-- queue/
    |   |   |-- SyncQueue.ts
    |   |   +-- QueueProcessor.ts
    |   +-- utils/
    |       |-- checksum.ts
    |       +-- timestamp.ts
    |
    |-- notifications/
    |   |-- NotificationManager.ts          # Push notification handler
    |   |-- NotificationTypes.ts
    |   |-- handlers/
    |   |   |-- messageNotification.ts
    |   |   |-- matchNotification.ts
    |   |   +-- callNotification.ts
    |   +-- channels/
    |       +-- androidChannels.ts          # Android notification channels
    |
    |-- store/
    |   |-- index.ts                         # Store configuration
    |   |-- slices/
    |   |   |-- authSlice.ts
    |   |   |-- chatSlice.ts
    |   |   |-- matchSlice.ts
    |   |   |-- profileSlice.ts
    |   |   |-- mediaSlice.ts
    |   |   |-- callSlice.ts
    |   |   +-- syncSlice.ts
    |   |-- middleware/
    |   |   |-- syncMiddleware.ts
    |   |   +-- loggerMiddleware.ts
    |   +-- selectors/
    |       |-- chatSelectors.ts
    |       +-- matchSelectors.ts
    |
    |-- utils/
    |   |-- constants.ts
    |   |-- dateUtils.ts
    |   |-- formatters.ts
    |   |-- validators.ts
    |   |-- platform.ts
    |   |-- permissions.ts
    |   |-- haptics.ts
    |   |-- debounce.ts
    |   |-- throttle.ts
    |   +-- logger.ts
    |
    |-- types/
    |   |-- api.ts
    |   |-- auth.ts
    |   |-- chat.ts
    |   |-- match.ts
    |   |-- media.ts
    |   |-- notification.ts
    |   |-- socket.ts
    |   |-- webrtc.ts
    |   +-- database.ts
    |
    |-- constants/
    |   |-- api.ts
    |   |-- colors.ts
    |   |-- config.ts
    |   |-- dimensions.ts
    |   |-- endpoints.ts
    |   |-- socketEvents.ts
    |   +-- webrtc.ts
    |
    +-- theme/
        |-- index.ts
        |-- colors.ts
        |-- typography.ts
        |-- spacing.ts
        |-- borderRadius.ts
        |-- shadows.ts
        +-- animations.ts
|
|-- __tests__/
|   |-- components/
|   |   |-- Button.test.tsx
|   |   |-- Input.test.tsx
|   |   +-- ChatBubble.test.tsx
|   |-- screens/
|   |   |-- LoginScreen.test.tsx
|   |   |-- DiscoverScreen.test.tsx
|   |   +-- ConversationScreen.test.tsx
|   |-- hooks/
|   |   |-- useAuth.test.ts
|   |   +-- useSocket.test.ts
|   |-- services/
|   |   +-- apiClient.test.ts
|   |-- database/
|   |   +-- migrations.test.ts
|   |-- store/
|   |   +-- authSlice.test.ts
|   +-- utils/
|       |-- validators.test.ts
|       +-- dateUtils.test.ts
|
|-- e2e/
|   |-- auth.e2e.ts
|   |-- onboarding.e2e.ts
|   |-- swiping.e2e.ts
|   |-- messaging.e2e.ts
|   +-- settings.e2e.ts
|
|-- plugins/
|   +-- withSQLCipher.js                   # Expo config plugin
|
+-- scripts/
    |-- generate-types.ts
    +-- seed-dev-data.ts
```
---

## 3. State Management

### Architecture: Zustand + React Query (TanStack Query)

**Why Zustand over Redux:**
- Zero boilerplate -- no action types, action creators, or reducers
- No providers needed -- hooks work anywhere in the component tree
- TypeScript-first with excellent type inference
- Built-in selectors to prevent unnecessary re-renders
- Middleware support (persist, devtools, immer)
- Tiny bundle size (~1KB)

**Why React Query for server state:**
- Automatic cache invalidation and refetching
- Background sync with stale-while-revalidate
- Optimistic updates out of the box
- Pagination and infinite scroll support
- Deduplication of requests

### Store Structure

```typescript
// src/store/index.ts
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { mmkvStorage } from '../services/storage/mmkvStorage';

interface AppState {
  // Auth state
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isBiometricEnabled: boolean;

  // UI state
  isOnline: boolean;
  activeChatId: string | null;
  unreadCounts: Record<string, number>;
  totalUnread: number;

  // Actions
  setUser: (user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setAuthenticated: (auth: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setOnline: (online: boolean) => void;
  setActiveChatId: (id: string | null) => void;
  updateUnreadCount: (conversationId: string, count: number) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set) => ({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isBiometricEnabled: false,
        isOnline: true,
        activeChatId: null,
        unreadCounts: {},
        totalUnread: 0,

        setUser: (user) => set((state) => { state.user = user; }),
        setTokens: (token, refreshToken) => set((state) => {
          state.token = token;
          state.refreshToken = refreshToken;
        }),
        setAuthenticated: (auth) => set((state) => { state.isAuthenticated = auth; }),
        setBiometricEnabled: (enabled) => set((state) => { state.isBiometricEnabled = enabled; }),
        setOnline: (online) => set((state) => { state.isOnline = online; }),
        setActiveChatId: (id) => set((state) => { state.activeChatId = id; }),
        updateUnreadCount: (conversationId, count) => set((state) => {
          state.unreadCounts[conversationId] = count;
          state.totalUnread = Object.values(state.unreadCounts).reduce((a, b) => a + b, 0);
        }),
        logout: () => set((state) => {
          state.user = null;
          state.token = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
        }),
      })),
      {
        name: 'ojchat-auth-storage',
        storage: createJSONStorage(() => mmkvStorage),
        partialize: (state) => ({
          token: state.token,
          refreshToken: state.refreshToken,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          isBiometricEnabled: state.isBiometricEnabled,
        }),
      }
    ),
    { name: 'OJChatStore' }
  )
);
```

### React Query Setup

```typescript
// src/services/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### Persisted Slices

| Slice | Persisted | Purpose |
|-------|-----------|---------|
| `authSlice` | Yes | Token, refresh token, user basics |
| `chatSlice` | Partial | Conversation list metadata |
| `matchSlice` | No | Fresh match data from server |
| `profileSlice` | Partial | Cached profile for offline display |
| `mediaSlice` | No | Ephemeral upload states |
| `callSlice` | No | Active call state only |
| `syncSlice` | Yes | Sync queue, last sync timestamp |
---

## 4. Navigation Architecture

### Navigator Hierarchy

The app uses a **flat navigation structure** with all screens registered directly on the `RootNavigator`. There are only 3 navigator files.

```
RootNavigator (NativeStack)
|
|-- Auth stack (when not authenticated):
|   |-- SplashScreen
|   |-- WelcomeScreen
|   |-- OnboardingFlow
|   |-- LoginScreen
|   |-- RegisterScreen
|   |-- OTPVerificationScreen
|   +-- ForgotPasswordScreen
|
|-- Main tabs (when authenticated):
|   |-- Discover
|   |-- Matches
|   |-- Chats
|   +-- Profile
|
|-- Push screens (NativeStack, pushed on top of tabs):
|   |-- Conversation
|   |-- EditProfile
|   |-- PhotoManager
|   |-- Settings
|   |-- Notifications
|   |-- Subscription
|   |-- Wallet
|   +-- SafetyTips
|
+-- Modal screens (presented modally):
    |-- Report
    |-- BlockConfirmation
    |-- IncomingCall
    |-- ActiveVoiceCall
    |-- ActiveVideoCall
    +-- Match
```

### Auth Navigator

```typescript
// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { OnboardingFlow } from '../screens/onboarding/OnboardingFlow';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OTPVerificationScreen } from '../screens/auth/OTPVerificationScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingFlow} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OTP" component={OTPVerificationScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
```

### Main Tab Navigator

```typescript
// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DiscoverScreen } from '../screens/main/DiscoverScreen';
import { MatchesScreen } from '../screens/main/MatchesScreen';
import { ChatsScreen } from '../screens/main/ChatsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { TabBarIcon } from '../components/common/TabBarIcon';
import { useTheme } from '../theme';

const Tab = createBottomTabNavigator();

export const MainTabNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: { paddingBottom: 8, height: 60 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ color, size }) => <TabBarIcon name="compass" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{
          tabBarIcon: ({ color, size }) => <TabBarIcon name="heart" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <TabBarIcon name="message-circle" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <TabBarIcon name="user" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};
```

### Root Navigator

```typescript
// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';

// Screens
import { ConversationScreen } from '../screens/chat/ConversationScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { PhotoManagerScreen } from '../screens/profile/PhotoManagerScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { SubscriptionScreen } from '../screens/subscription/SubscriptionScreen';
import { WalletScreen } from '../screens/subscription/WalletScreen';
import { SafetyTips } from '../screens/safety/SafetyTips';
import { ReportScreen } from '../screens/safety/ReportScreen';
import { BlockConfirmation } from '../screens/safety/BlockConfirmation';
import { IncomingCallScreen } from '../screens/call/IncomingCallScreen';
import { ActiveVoiceCallScreen } from '../screens/call/ActiveVoiceCallScreen';
import { ActiveVideoCallScreen } from '../screens/call/ActiveVideoCallScreen';
import { MatchScreen } from '../screens/match/MatchScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />

            {/* Push screens */}
            <Stack.Screen name="Conversation" component={ConversationScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="PhotoManager" component={PhotoManagerScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="SafetyTips" component={SafetyTips} />

            {/* Modal screens */}
            <Stack.Screen
              name="Report"
              component={ReportScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="BlockConfirmation"
              component={BlockConfirmation}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="IncomingCall"
              component={IncomingCallScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="ActiveVoiceCall"
              component={ActiveVoiceCallScreen}
              options={{ presentation: 'fullScreenModal' }}
            />
            <Stack.Screen
              name="ActiveVideoCall"
              component={ActiveVideoCallScreen}
              options={{ presentation: 'fullScreenModal' }}
            />
            <Stack.Screen
              name="Match"
              component={MatchScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### Screen Mapping

| Category | Screen Name | Component | Presentation |
|----------|------------|-----------|-------------|
| **Auth** | `Splash` | SplashScreen | push |
| | `Welcome` | WelcomeScreen | push |
| | `Onboarding` | OnboardingFlow | push |
| | `Login` | LoginScreen | push |
| | `Register` | RegisterScreen | push |
| | `OTP` | OTPVerificationScreen | push |
| | `ForgotPassword` | ForgotPasswordScreen | push |
| **Main Tabs** | `Discover` | DiscoverScreen | tab |
| | `Matches` | MatchesScreen | tab |
| | `Chats` | ChatsScreen | tab |
| | `Profile` | ProfileScreen | tab |
| **Push** | `Conversation` | ConversationScreen | push |
| | `EditProfile` | EditProfileScreen | push |
| | `PhotoManager` | PhotoManagerScreen | push |
| | `Settings` | SettingsScreen | push |
| | `Notifications` | NotificationsScreen | push |
| | `Subscription` | SubscriptionScreen | push |
| | `Wallet` | WalletScreen | push |
| | `SafetyTips` | SafetyTips | push |
| **Modal** | `Report` | ReportScreen | modal |
| | `BlockConfirmation` | BlockConfirmation | modal |
| | `IncomingCall` | IncomingCallScreen | modal |
| | `ActiveVoiceCall` | ActiveVoiceCallScreen | fullScreenModal |
| | `ActiveVideoCall` | ActiveVideoCallScreen | fullScreenModal |
| | `Match` | MatchScreen | modal |
---

## 5. Offline-First SQLite Setup

### SQLCipher Connection

```typescript
// src/database/connection.ts
import * as SQLite from 'expo-sqlite';
import * as Keychain from 'react-native-keychain';
import { migrations } from './migrations';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  // Retrieve encryption key from secure storage (Keychain/Keystore)
  const encryptionKey = await getOrCreateEncryptionKey();

  db = await SQLite.openDatabaseAsync('ojchat.db', {
    encryptionKey,
  });

  // Enable WAL mode for better concurrent performance
  await db.execAsync('PRAGMA journal_mode=WAL;');
  await db.execAsync('PRAGMA foreign_keys=ON;');

  // Run migrations
  await runMigrations(db);

  return db;
}

async function getOrCreateEncryptionKey(): Promise<string> {
  const SERVICE_NAME = 'com.ojchat.database';

  const credentials = await Keychain.getInternetCredentials(SERVICE_NAME);
  if (credentials) {
    return credentials.password;
  }

  // Generate new 256-bit key
  const newKey = generateSecureKey(32);
  await Keychain.setInternetCredentials(
    SERVICE_NAME,
    'ojchat-db',
    newKey,
    {
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
    }
  );

  return newKey;
}

function generateSecureKey(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
```

### Migration System

```typescript
// src/database/migrations/index.ts
import { SQLiteDatabase } from 'expo-sqlite';
import { migration001 } from './001_initial';
import { migration002 } from './002_messages';
import { migration003 } from './003_media';
import { migration004 } from './004_sync_metadata';

interface Migration {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
}

const migrationList: Migration[] = [
  migration001,
  migration002,
  migration003,
  migration004,
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  // Create migrations tracking table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Get applied migrations
  const applied = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM _migrations ORDER BY version'
  );
  const appliedVersions = new Set(applied.map((r) => r.version));

  // Apply pending migrations in order
  for (const migration of migrationList) {
    if (!appliedVersions.has(migration.version)) {
      await db.execAsync('BEGIN TRANSACTION;');
      try {
        await migration.up(db);
        await db.runAsync(
          'INSERT INTO _migrations (version) VALUES (?);',
          [migration.version]
        );
        await db.execAsync('COMMIT;');
      } catch (error) {
        await db.execAsync('ROLLBACK;');
        throw new Error(
          `Migration ${migration.version} failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }
}
```

### Initial Migration

```typescript
// src/database/migrations/001_initial.ts
import { SQLiteDatabase } from 'expo-sqlite';
import { Migration } from './index';

export const migration001: Migration = {
  version: 1,
  up: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        display_name TEXT NOT NULL,
        bio TEXT,
        date_of_birth TEXT NOT NULL,
        gender TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        last_active_at TEXT,
        is_verified INTEGER DEFAULT 0,
        profile_completion INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE preferences (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        min_age INTEGER DEFAULT 18,
        max_age INTEGER DEFAULT 50,
        max_distance INTEGER DEFAULT 50,
        gender_preference TEXT DEFAULT 'all',
        show_me INTEGER DEFAULT 1
      );

      CREATE TABLE interests (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL UNIQUE,
        category TEXT
      );

      CREATE TABLE user_interests (
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        interest_id TEXT REFERENCES interests(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, interest_id)
      );

      CREATE TABLE photos (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        local_path TEXT,
        position INTEGER DEFAULT 0,
        is_primary INTEGER DEFAULT 0,
        blur_hash TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);
  },
};
```

### Repository Pattern

```typescript
// src/database/repositories/messageRepository.ts
import { getDatabase } from '../connection';
import { Message } from '../models/Message';

export class MessageRepository {
  static async getByConversation(
    conversationId: string,
    limit = 50,
    offset = 0
  ): Promise<Message[]> {
    const db = await getDatabase();
    return db.getAllAsync<Message>(
      `SELECT m.*, u.display_name as sender_name, u.avatar_url as sender_avatar
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [conversationId, limit, offset]
    );
  }

  static async insert(message: Omit<Message, 'id'>): Promise<Message> {
    const db = await getDatabase();
    const id = generateUUID();
    await db.runAsync(
      `INSERT INTO messages (id, conversation_id, sender_id, content, type, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [id, message.conversation_id, message.sender_id, message.content, message.type, 'pending']
    );
    return { ...message, id } as Message;
  }

  static async updateStatus(id: string, status: Message['status']): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE messages SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  static async getPendingMessages(): Promise<Message[]> {
    const db = await getDatabase();
    return db.getAllAsync<Message>(
      "SELECT * FROM messages WHERE status = 'pending' ORDER BY created_at ASC"
    );
  }
}
```
---

## 6. Background Sync Engine

### Sync Architecture Overview

```
+-------------------+     +-------------------+     +-------------------+
|   Local Changes   | --> |   Sync Queue      | --> |  Sync Processor   |
|   (SQLite)        |     |   (FIFO Order)    |     |  (Background)     |
+-------------------+     +-------------------+     +-------------------+
                                                          |
                                                          v
+-------------------+     +-------------------+     +-------------------+
|   Conflict        | <-- |   Server API      | <-- |  Network Layer    |
|   Resolution      |     |   Requests        |     |  (Online Check)   |
+-------------------+     +-------------------+     +-------------------+
```

### SyncEngine Implementation

```typescript
// src/sync/SyncEngine.ts
import { AppState, AppStateStatus } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { SyncQueue } from './queue/SyncQueue';
import { QueueProcessor } from './queue/QueueProcessor';
import { useAppStore } from '../store';

export class SyncEngine {
  private static instance: SyncEngine;
  private syncQueue: SyncQueue;
  private processor: QueueProcessor;
  private isRunning = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncTimestamp: number = 0;

  static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  private constructor() {
    this.syncQueue = new SyncQueue();
    this.processor = new QueueProcessor();
    this.setupListeners();
  }

  private setupListeners(): void {
    AppState.addEventListener('change', this.handleAppState);
    NetInfo.addEventListener(this.handleNetworkChange);
  }

  private handleAppState = (state: AppStateStatus): void => {
    if (state === 'active') {
      this.startSync();
    } else if (state === 'background') {
      this.scheduleBackgroundSync();
    }
  };

  private handleNetworkChange = (info: NetInfoState): void => {
    useAppStore.getState().setOnline(info.isConnected ?? false);
    if (info.isConnected) {
      this.startSync();
    }
  };

  async startSync(): Promise<void> {
    if (this.isRunning || !useAppStore.getState().isOnline) return;

    this.isRunning = true;
    try {
      await this.syncQueue.flush();
      await this.processor.processPending();
      this.lastSyncTimestamp = Date.now();
    } catch (error) {
      console.error('[SyncEngine] Sync failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  enqueue(action: SyncAction): void {
    this.syncQueue.enqueue(action);
    if (useAppStore.getState().isOnline) {
      this.startSync();
    }
  }

  private scheduleBackgroundSync(): void {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = setInterval(() => {
      if (useAppStore.getState().isOnline) {
        this.startSync();
      }
    }, 30_000);
  }

  destroy(): void {
    if (this.syncInterval) clearInterval(this.syncInterval);
  }
}
```

### Queue Processor with Conflict Resolution

```typescript
// src/sync/queue/QueueProcessor.ts
import { getDatabase } from '../../database/connection';
import { conflictResolver } from '../strategies/conflictResolution';
import { apiClient } from '../../services/api/apiClient';
import { SyncAction } from '../types';

export class QueueProcessor {
  async processPending(): Promise<void> {
    const db = await getDatabase();
    const pending = await db.getAllAsync<SyncAction>(
      `SELECT * FROM sync_queue WHERE status = 'pending'
       ORDER BY priority ASC, created_at ASC
       LIMIT 100`
    );

    for (const action of pending) {
      try {
        await db.runAsync(
          "UPDATE sync_queue SET status = 'processing' WHERE id = ?",
          [action.id]
        );

        await this.executeAction(action);

        await db.runAsync(
          "UPDATE sync_queue SET status = 'completed', completed_at = datetime('now') WHERE id = ?",
          [action.id]
        );
      } catch (error) {
        await this.handleError(action, error);
      }
    }
  }

  private async executeAction(action: SyncAction): Promise<void> {
    switch (action.type) {
      case 'CREATE_MESSAGE':
        await this.syncMessage(action);
        break;
      case 'UPDATE_PROFILE':
        await this.syncProfile(action);
        break;
      case 'UPLOAD_MEDIA':
        await this.syncMedia(action);
        break;
      case 'SEND_REACTION':
        await this.syncReaction(action);
        break;
      default:
        console.warn(`[QueueProcessor] Unknown action type: ${action.type}`);
    }
  }

  private async syncMessage(action: SyncAction): Promise<void> {
    const { localId, payload } = action;
    const serverMessage = await apiClient.get(`/messages/${payload.serverId}`).catch(() => null);

    if (serverMessage) {
      const resolved = conflictResolver.resolve(
        { ...payload, id: localId },
        serverMessage.data
      );
      await apiClient.put(`/messages/${resolved.id}`, resolved);
    } else {
      const response = await apiClient.post('/messages', payload);
      await this.updateLocalIdMapping(localId, response.data.id);
    }
  }

  private async handleError(action: SyncAction, error: unknown): Promise<void> {
    const db = await getDatabase();
    const retryCount = (action.retryCount ?? 0) + 1;
    const maxRetries = 5;

    if (retryCount >= maxRetries) {
      await db.runAsync(
        "UPDATE sync_queue SET status = 'failed', error = ? WHERE id = ?",
        [String(error), action.id]
      );
    } else {
      const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 60_000);
      await db.runAsync(
        "UPDATE sync_queue SET status = 'pending', retry_count = ? WHERE id = ?",
        [retryCount, action.id]
      );
      setTimeout(() => this.processPending(), backoffMs);
    }
  }

  private async updateLocalIdMapping(localId: string, serverId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO id_mappings (local_id, server_id, entity_type, synced_at) VALUES (?, ?, ?, datetime("now"))',
      [localId, serverId, 'message']
    );
  }
}
```

### Conflict Resolution Strategies

```typescript
// src/sync/strategies/conflictResolution.ts
import { SyncEntity } from '../types';

export const conflictResolver = {
  // Last-Write-Wins (LWW) using timestamps
  resolve<T extends SyncEntity>(local: T, server: T): T {
    if (local.updated_at > server.updated_at) {
      return local;
    }
    return server;
  },

  // Field-level merge for profiles
  mergeProfiles(local: Profile, server: Profile): Profile {
    const fieldTimestamps: Record<string, string> = local._fieldTimestamps ?? {};

    return {
      ...server,
      ...Object.fromEntries(
        Object.entries(local).filter(([key, value]) => {
          return fieldTimestamps[key] && fieldTimestamps[key] > (server._fieldTimestamps?.[key] ?? '');
        })
      ),
    };
  },

  // CRDT for message reactions (commutative)
  mergeReactions(local: Reaction[], server: Reaction[]): Reaction[] {
    const map = new Map<string, Reaction>();
    for (const r of [...server, ...local]) {
      map.set(`${r.userId}:${r.emoji}`, r);
    }
    return Array.from(map.values());
  },
};
```
---

## 7. Socket.IO Client Setup

### Socket Manager

```typescript
// src/socket/SocketManager.ts
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../store';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import { MessageHandler } from './eventHandlers/messageHandler';
import { TypingHandler } from './eventHandlers/typingHandler';
import { PresenceHandler } from './eventHandlers/presenceHandler';
import { MatchHandler } from './eventHandlers/matchHandler';
import { CallHandler } from './eventHandlers/callHandler';

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  private messageHandler: MessageHandler;
  private typingHandler: TypingHandler;
  private presenceHandler: PresenceHandler;
  private matchHandler: MatchHandler;
  private callHandler: CallHandler;

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  private constructor() {
    this.messageHandler = new MessageHandler();
    this.typingHandler = new TypingHandler();
    this.presenceHandler = new PresenceHandler();
    this.matchHandler = new MatchHandler();
    this.callHandler = new CallHandler();
  }

  connect(): void {
    const { token } = useAppStore.getState();
    if (!token || this.socket?.connected) return;

    this.socket = io(process.env.EXPO_PUBLIC_WS_URL!, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      timeout: 10000,
    });

    this.registerEventHandlers();
    this.registerConnectionHandlers();
  }

  private registerEventHandlers(): void {
    if (!this.socket) return;

    // Message events
    this.socket.on(SOCKET_EVENTS.MESSAGE_NEW, this.messageHandler.onNewMessage);
    this.socket.on(SOCKET_EVENTS.MESSAGE_UPDATED, this.messageHandler.onMessageUpdated);
    this.socket.on(SOCKET_EVENTS.MESSAGE_DELETED, this.messageHandler.onMessageDeleted);
    this.socket.on(SOCKET_EVENTS.MESSAGE_READ, this.messageHandler.onMessageRead);

    // Typing events
    this.socket.on(SOCKET_EVENTS.TYPING_START, this.typingHandler.onTypingStart);
    this.socket.on(SOCKET_EVENTS.TYPING_STOP, this.typingHandler.onTypingStop);

    // Presence events
    this.socket.on(SOCKET_EVENTS.USER_ONLINE, this.presenceHandler.onUserOnline);
    this.socket.on(SOCKET_EVENTS.USER_OFFLINE, this.presenceHandler.onUserOffline);

    // Match events
    this.socket.on(SOCKET_EVENTS.MATCH_NEW, this.matchHandler.onNewMatch);
    this.socket.on(SOCKET_EVENTS.MATCH_LIKE, this.matchHandler.onLikeReceived);

    // Call events
    this.socket.on(SOCKET_EVENTS.CALL_INCOMING, this.callHandler.onIncomingCall);
    this.socket.on(SOCKET_EVENTS.CALL_ACCEPTED, this.callHandler.onCallAccepted);
    this.socket.on(SOCKET_EVENTS.CALL_REJECTED, this.callHandler.onCallRejected);
    this.socket.on(SOCKET_EVENTS.CALL_ENDED, this.callHandler.onCallEnded);

    // WebRTC signaling
    this.socket.on(SOCKET_EVENTS.WEBRTC_OFFER, this.callHandler.onOffer);
    this.socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, this.callHandler.onAnswer);
    this.socket.on(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, this.callHandler.onIceCandidate);
  }

  private registerConnectionHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected');
      this.reconnectAttempts = 0;
      useAppStore.getState().setOnline(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      useAppStore.getState().setOnline(false);

      if (reason === 'io server disconnect') {
        this.reconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.handleMaxReconnectReached();
      }
    });
  }

  emit(event: string, data?: unknown, callback?: (response: unknown) => void): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Not connected, queueing event');
      this.queueOfflineEvent(event, data);
      return;
    }

    if (callback) {
      this.socket.emit(event, data, callback);
    } else {
      this.socket.emit(event, data);
    }
  }

  private queueOfflineEvent(event: string, data?: unknown): void {
    const { SyncEngine } = require('../sync/SyncEngine');
    SyncEngine.getInstance().enqueue({
      type: 'SOCKET_EVENT',
      payload: { event, data },
      priority: 2,
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export default SocketManager;
```

### Message Handler

```typescript
// src/socket/eventHandlers/messageHandler.ts
import { Message } from '../../types/chat';
import { useAppStore } from '../../store';
import { MessageRepository } from '../../database/repositories/messageRepository';

export class MessageHandler {
  onNewMessage = async (message: Message): Promise<void> => {
    await MessageRepository.insert(message);

    const { activeChatId } = useAppStore.getState();
    if (activeChatId === message.conversation_id) {
      useAppStore.getState().addMessage(message);
    } else {
      useAppStore.getState().incrementUnread(message.conversation_id);
    }

    // Send delivery receipt
    SocketManager.getInstance().emit('message:delivered', {
      messageId: message.id,
    });
  };

  onMessageUpdated = async (data: { id: string; content: string }): Promise<void> => {
    await MessageRepository.updateContent(data.id, data.content);
    useAppStore.getState().updateMessage(data.id, { content: data.content });
  };

  onMessageDeleted = async (data: { id: string; conversationId: string }): Promise<void> => {
    await MessageRepository.softDelete(data.id);
    useAppStore.getState().removeMessage(data.id);
  };

  onMessageRead = async (data: { conversationId: string; readAt: string; userId: string }): Promise<void> => {
    await MessageRepository.markAsRead(data.conversationId, data.readAt);
    useAppStore.getState().markMessagesRead(data.conversationId);
  };
}
```
---

## 8. WebRTC Client Setup

### WebRTC Manager

```typescript
// src/webrtc/WebRTCManager.ts
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
  mediaDevices,
} from 'react-native-webrtc';
import { SocketManager } from '../socket/SocketManager';
import { ICE_SERVERS } from './signaling/iceServerConfig';
import { CallQualityMonitor } from './utils/callQuality';

interface CallState {
  callId: string;
  peerId: string;
  isInitiator: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  state: 'connecting' | 'ringing' | 'connected' | 'ended';
  quality: CallQualityMonitor;
}

export class WebRTCManager {
  private static instance: WebRTCManager;
  private state: CallState | null = null;
  private qualityMonitor: CallQualityMonitor;

  static getInstance(): WebRTCManager {
    if (!WebRTCManager.instance) {
      WebRTCManager.instance = new WebRTCManager();
    }
    return WebRTCManager.instance;
  }

  private constructor() {
    this.qualityMonitor = new CallQualityMonitor();
  }

  async startCall(peerId: string, type: 'audio' | 'video'): Promise<void> {
    const localStream = await this.getLocalStream(type);
    const peerConnection = this.createPeerConnection();

    peerConnection.addStream(localStream);

    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: type === 'video',
    });
    await peerConnection.setLocalDescription(offer);

    this.state = {
      callId: generateCallId(),
      peerId,
      isInitiator: true,
      localStream,
      remoteStream: null,
      peerConnection,
      state: 'connecting',
      quality: this.qualityMonitor,
    };

    SocketManager.getInstance().emit('call:signal', {
      type: 'offer',
      callId: this.state.callId,
      targetUserId: peerId,
      sdp: offer,
    });
  }

  async acceptCall(callId: string, offer: RTCSessionDescription): Promise<void> {
    const localStream = await this.getLocalStream('video');
    const peerConnection = this.createPeerConnection();

    peerConnection.addStream(localStream);
    await peerConnection.setRemoteDescription(offer);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    this.state = {
      callId,
      peerId: '',
      isInitiator: false,
      localStream,
      remoteStream: null,
      peerConnection,
      state: 'connected',
      quality: this.qualityMonitor,
    };

    SocketManager.getInstance().emit('call:signal', {
      type: 'answer',
      callId,
      sdp: answer,
    });
  }

  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 10,
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        SocketManager.getInstance().emit('call:signal', {
          type: 'ice-candidate',
          callId: this.state?.callId,
          candidate: event.candidate,
        });
      }
    };

    pc.onaddstream = (event) => {
      if (this.state) {
        this.state.remoteStream = event.stream;
        this.state.quality.startMonitoring(event.stream);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE state:', pc.iceConnectionState);
      switch (pc.iceConnectionState) {
        case 'connected':
        case 'completed':
          this.state && (this.state.state = 'connected');
          break;
        case 'disconnected':
          this.handleDisconnect();
          break;
        case 'failed':
          this.handleConnectionFailed();
          break;
      }
    };

    return pc;
  }

  private async getLocalStream(type: 'audio' | 'video'): Promise<MediaStream> {
    const constraints: MediaStreamConstraints = {
      audio: true,
      video: type === 'video'
        ? {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          }
        : false,
    };

    return await mediaDevices.getUserMedia(constraints);
  }

  async toggleMute(): Promise<boolean> {
    if (!this.state?.localStream) return false;
    const audioTrack = this.state.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return !audioTrack.enabled;
    }
    return false;
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.state?.localStream) return false;
    const videoTrack = this.state.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return !videoTrack.enabled;
    }
    return false;
  }

  async switchCamera(): Promise<void> {
    if (!this.state?.localStream) return;
    const videoTrack = this.state.localStream.getVideoTracks()[0];
    if (videoTrack) {
      await videoTrack._switchCamera();
    }
  }

  async endCall(): Promise<void> {
    if (this.state?.peerConnection) {
      this.state.peerConnection.close();
    }
    this.state?.localStream?.getTracks().forEach((track) => track.stop());

    SocketManager.getInstance().emit('call:end', {
      callId: this.state?.callId,
    });

    this.state = null;
  }

  private handleDisconnect(): void {
    if (this.state?.peerConnection) {
      this.state.peerConnection.restartIce();
    }
  }

  private handleConnectionFailed(): void {
    this.endCall();
  }

  getLocalStream(): MediaStream | null {
    return this.state?.localStream ?? null;
  }

  getRemoteStream(): MediaStream | null {
    return this.state?.remoteStream ?? null;
  }

  getCallState(): CallState | null {
    return this.state;
  }
}
```

### ICE Server Configuration

```typescript
// src/webrtc/signaling/iceServerConfig.ts
export const ICE_SERVERS: RTCIceServer[] = [
  {
    urls: 'stun:stun.l.google.com:19302',
  },
  {
    urls: 'stun:stun1.l.google.com:19302',
  },
  {
    urls: 'turn:ojchat-turn.com:3478',
    username: process.env.EXPO_PUBLIC_TURN_USERNAME!,
    credential: process.env.EXPO_PUBLIC_TURN_CREDENTIAL!,
  },
];
```
---

## 9. Push Notification Handling

### Notification Manager

```typescript
// src/notifications/NotificationManager.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiClient } from '../services/api/apiClient';
import { useAppStore } from '../store';
import { registerForPushNotificationsAsync } from './utils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationManager {
  private static instance: NotificationManager;
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription;
  private responseListener: Notifications.Subscription;

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async initialize(): Promise<void> {
    if (!Device.isDevice) {
      console.log('[Notifications] Must use physical device for push notifications');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted');
      return;
    }

    this.expoPushToken = await registerForPushNotificationsAsync();
    await this.registerTokenWithBackend(this.expoPushToken);

    if (Platform.OS === 'android') {
      await this.setupAndroidChannels();
    }

    this.notificationListener = Notifications.addNotificationReceivedListener(
      this.handleNotificationReceived
    );

    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse
    );
  }

  private async registerTokenWithBackend(token: string): Promise<void> {
    try {
      await apiClient.post('/notifications/register', {
        token,
        platform: Platform.OS,
        deviceId: await Device.getDeviceIdAsync(),
      });
    } catch (error) {
      console.error('[Notifications] Failed to register token:', error);
    }
  }

  private async setupAndroidChannels(): Promise<void> {
    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Messages',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
      sound: 'message.wav',
    });

    await Notifications.setNotificationChannelAsync('calls', {
      name: 'Calls',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 1000],
      sound: 'ringtone.wav',
    });

    await Notifications.setNotificationChannelAsync('matches', {
      name: 'Matches',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'match.wav',
    });
  }

  private handleNotificationReceived = (notification: Notifications.Notification): void => {
    const data = notification.request.content.data;

    switch (data.type) {
      case 'message':
        useAppStore.getState().incrementUnread(data.conversationId);
        break;
      case 'match':
        useAppStore.getState().addNewMatch(data.match);
        break;
      case 'call':
        // Show incoming call modal
        break;
    }
  };

  private handleNotificationResponse = (response: Notifications.NotificationResponse): void => {
    const data = response.notification.request.content.data;

    switch (data.type) {
      case 'message':
        navigation.navigate('Chats', {
          screen: 'Conversation',
          params: { conversationId: data.conversationId },
        });
        break;
      case 'match':
        navigation.navigate('Matches');
        break;
      case 'call':
        if (data.action === 'accept') {
          WebRTCManager.getInstance().acceptCall(data.callId, data.offer);
        }
        break;
    }
  };

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  destroy(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}
```

### Android Notification Channels

```typescript
// src/notifications/channels/androidChannels.ts
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export interface NotificationChannelConfig {
  id: string;
  name: string;
  importance: Notifications.AndroidImportance;
  sound?: string;
  vibrationPattern?: number[];
  lightColor?: string;
}

export const CHANNELS: NotificationChannelConfig[] = [
  {
    id: 'messages',
    name: 'Messages',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'message',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF6B6B',
  },
  {
    id: 'calls',
    name: 'Incoming Calls',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'ringtone',
    vibrationPattern: [0, 500, 500],
  },
  {
    id: 'matches',
    name: 'New Matches',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'match',
  },
  {
    id: 'likes',
    name: 'Likes',
    importance: Notifications.AndroidImportance.LOW,
  },
  {
    id: 'system',
    name: 'System Notifications',
    importance: Notifications.AndroidImportance.LOW,
  },
];

export async function createNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  for (const channel of CHANNELS) {
    await Notifications.setNotificationChannelAsync(channel.id, {
      name: channel.name,
      importance: channel.importance,
      sound: channel.sound,
      vibrationPattern: channel.vibrationPattern,
      lightColor: channel.lightColor,
    });
  }
}
```
---

## 10. Biometric Authentication

```typescript
// src/services/storage/biometricAuth.ts
import * as LocalAuthentication from 'expo-local-authentication';
import * as Keychain from 'react-native-keychain';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType: 'fingerprint' | 'face' | 'iris' | null;
}

export class BiometricAuthService {
  static async isAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  }

  static async getBiometricType(): Promise<'fingerprint' | 'face' | 'iris' | null> {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.length === 0) return null;

    const typeMap: Record<number, 'fingerprint' | 'face' | 'iris'> = {
      1: 'fingerprint',
      2: 'face',
      3: 'iris',
    };

    return typeMap[types[0]] ?? null;
  }

  static async authenticate(reason: string): Promise<BiometricAuthResult> {
    const biometricType = await this.getBiometricType();

    if (!biometricType) {
      return { success: false, error: 'Biometric not available', biometricType: null };
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use Passcode',
      });

      return {
        success: result.success,
        biometricType,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
        biometricType,
      };
    }
  }

  static async storeCredentials(username: string, password: string): Promise<boolean> {
    try {
      await Keychain.setGenericPassword(username, password, {
        service: 'com.ojchat.auth',
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      });
      return true;
    } catch (error) {
      console.error('[Biometric] Store credentials failed:', error);
      return false;
    }
  }

  static async retrieveCredentials(): Promise<{
    username: string;
    password: string;
  } | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: 'com.ojchat.auth',
        authenticationPrompt: {
          title: 'Authenticate to sign in',
          subtitle: 'Verify your identity to continue',
          cancel: 'Cancel',
        },
      });

      return credentials ? credentials : null;
    } catch (error) {
      console.error('[Biometric] Retrieve credentials failed:', error);
      return null;
    }
  }

  static async deleteCredentials(): Promise<boolean> {
    try {
      return await Keychain.resetGenericPassword({
        service: 'com.ojchat.auth',
      });
    } catch (error) {
      console.error('[Biometric] Delete credentials failed:', error);
      return false;
    }
  }
}
```
---

## 11. Image Handling

### Image Processing Pipeline

```typescript
// src/utils/imageProcessing.ts
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { apiClient } from '../services/api/apiClient';

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
  blurHash?: string;
}

export class ImageProcessor {
  static async pickImage(options?: ImagePicker.ImagePickerOptions): Promise<ProcessedImage | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
      ...options,
    });

    if (result.canceled) return null;
    return this.processImage(result.assets[0].uri);
  }

  static async takePhoto(): Promise<ProcessedImage | null> {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return null;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });

    if (result.canceled) return null;
    return this.processImage(result.assets[0].uri);
  }

  static async processImage(uri: string): Promise<ProcessedImage> {
    const resized = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      {
        compress: 0.82,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    const fileInfo = await FileSystem.getInfoAsync(resized.uri);
    const blurHash = await this.generateBlurHash(resized.uri);

    return {
      uri: resized.uri,
      width: resized.width,
      height: resized.height,
      size: fileInfo.size ?? 0,
      mimeType: 'image/jpeg',
      blurHash,
    };
  }

  static async cropImage(
    uri: string,
    cropData: { x: number; y: number; width: number; height: number }
  ): Promise<ProcessedImage> {
    const cropped = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          crop: {
            originX: cropData.x,
            originY: cropData.y,
            width: cropData.width,
            height: cropData.height,
          },
        },
      ],
      {
        compress: 0.82,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return this.processImage(cropped.uri);
  }

  static async createThumbnail(uri: string): Promise<string> {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 200, height: 200 } }],
      {
        compress: 0.6,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result.uri;
  }

  static async uploadImage(
    processedImage: ProcessedImage,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const formData = new FormData();
    formData.append('photo', {
      uri: processedImage.uri,
      type: processedImage.mimeType,
      name: `photo_${Date.now()}.jpg`,
    } as unknown as Blob);

    const response = await apiClient.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return response.data.url;
  }

  private static async generateBlurHash(uri: string): Promise<string> {
    return 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH';
  }
}
```
---

## 12. Key Libraries

### Core Dependencies

| Category | Library | Purpose |
|----------|---------|---------|
| **UI Framework** | `react-native-reanimated` | 60fps animations on UI thread |
| | `react-native-gesture-handler` | Native gesture system |
| | `react-native-safe-area-context` | Safe area insets |
| | `@shopify/flash-list` | High-performance FlatList replacement |
| | `lottie-react-native` | Complex animations (like/match) |
| | `expo-haptics` | Tactile feedback |
| **Navigation** | `@react-navigation/native` | Navigation core |
| | `@react-navigation/native-stack` | Native stack navigator |
| | `@react-navigation/bottom-tabs` | Bottom tab navigator |
| **State** | `zustand` | Client state management |
| | `@tanstack/react-query` | Server state management |
| | `react-native-mmkv` | High-speed key-value storage |
| **Database** | `expo-sqlite` | SQLite database |
| | `drizzle-orm` | Type-safe SQL ORM |
| **Crypto** | `expo-crypto` | Hashing, random bytes |
| | `react-native-keychain` | Secure credential storage |
| **Media** | `expo-image-picker` | Image selection |
| | `expo-image-manipulator` | Image processing |
| | `expo-camera` | Camera access |
| | `expo-media-library` | Photo library access |
| | `expo-file-system` | File operations |
| **Network** | `socket.io-client` | WebSocket connections |
| | `axios` | HTTP client |
| | `@react-native-community/netinfo` | Network status |
| **Real-time** | `react-native-webrtc` | WebRTC audio/video |
| **Notifications** | `expo-notifications` | Push notifications |
| **Auth** | `expo-local-authentication` | Biometric auth |
| **Analytics** | `@sentry/react-native` | Crash reporting |
| | `expo-analytics` | Event tracking |
| **Testing** | `jest` | Unit testing |
| | `@testing-library/react-native` | Component testing |
| | `detox` | E2E testing |
| | `msw` | API mocking |

### Dev Dependencies

| Library | Purpose |
|---------|---------|
| `typescript` | Type checking |
| `eslint` + `prettier` | Code quality |
| `husky` + `lint-staged` | Git hooks |
| `drizzle-kit` | Database migrations |
| `@storybook/react-native` | Component stories |
| `reactotron-react-native` | Debugging |
| `expo-dev-client` | Development builds |
---

## 13. Error Handling Strategy

### Error Boundaries

```typescript
// src/components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Sentry from '@sentry/react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, errorInfo);
    Sentry.captureException(error, { extra: errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            Something went wrong
          </Text>
          <Text style={{ color: '#666', textAlign: 'center', marginBottom: 20 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            onPress={this.handleRetry}
            style={{ backgroundColor: '#FF6B6B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
```

### Global Error Handler

```typescript
// src/utils/errorHandler.ts
import * as Sentry from '@sentry/react-native';
import { apiClient } from '../services/api/apiClient';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class AppError extends Error {
  severity: ErrorSeverity;
  code: string;
  context: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.context = context;
  }
}

export const errorHandler = {
  handle(error: unknown, context?: Record<string, unknown>): void {
    if (error instanceof AppError) {
      this.handleAppError(error);
    } else if (error instanceof Error) {
      this.handleGenericError(error, context);
    } else {
      this.handleUnknownError(error, context);
    }
  },

  handleAppError(error: AppError): void {
    console.error(`[${error.code}] ${error.message}`, error.context);

    Sentry.withScope((scope) => {
      scope.setTag('error_code', error.code);
      scope.setTag('severity', error.severity);
      scope.setExtras(error.context);
      Sentry.captureException(error);
    });

    if (error.severity === ErrorSeverity.CRITICAL) {
      this.notifyUser(error.message);
    }
  },

  handleGenericError(error: Error, context?: Record<string, unknown>): void {
    console.error('[GenericError]', error.message, context);

    Sentry.withScope((scope) => {
      if (context) scope.setExtras(context);
      Sentry.captureException(error);
    });
  },

  handleUnknownError(error: unknown, context?: Record<string, unknown>): void {
    console.error('[UnknownError]', error, context);
    Sentry.captureMessage(`Unknown error: ${String(error)}`);
  },

  notifyUser(message: string): void {
    // Show toast or alert to user
  },

  async reportToServer(error: AppError): Promise<void> {
    try {
      await apiClient.post('/errors/report', {
        code: error.code,
        message: error.message,
        severity: error.severity,
        context: error.context,
        platform: Platform.OS,
        appVersion: Constants.expoConfig?.version,
      });
    } catch {
      // Silently fail
    }
  },
};
```

### API Error Interceptor

```typescript
// src/services/api/apiClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAppStore } from '../../store';
import { errorHandler, ErrorSeverity, AppError } from '../../utils/errorHandler';
import { BiometricAuthService } from '../storage/biometricAuth';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { token } = useAppStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAppStore.getState();
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );

        const { token, refreshToken: newRefreshToken } = response.data;
        useAppStore.getState().setTokens(token, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAppStore.getState().logout();
        BiometricAuthService.deleteCredentials();
        return Promise.reject(refreshError);
      }
    }

    if (!error.response) {
      errorHandler.handle(
        new AppError(
          'Network error. Please check your connection.',
          'NETWORK_ERROR',
          ErrorSeverity.MEDIUM
        )
      );
    }

    if (error.response?.status && error.response.status >= 500) {
      errorHandler.handle(
        new AppError(
          'Server error. Please try again later.',
          'SERVER_ERROR',
          ErrorSeverity.HIGH,
          { status: error.response.status, url: originalRequest.url }
        )
      );
    }

    return Promise.reject(error);
  }
);
```
---

## 14. Performance Optimization

### FlashList (High-Performance FlatList)

```typescript
// src/components/chat/ChatList.tsx
import React, { useCallback } from 'react';
import { FlashList } from '@shopify/flash-list';
import { ConversationItem } from './ConversationItem';
import { useConversations } from '../../hooks/useConversations';
import { Conversation } from '../../types/chat';

export const ChatList: React.FC = () => {
  const { conversations, isLoading, loadMore } = useConversations();

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationItem conversation={item} />
    ),
    []
  );

  const keyExtractor = useCallback(
    (item: Conversation) => item.id,
    []
  );

  const onEndReached = useCallback(() => {
    loadMore();
  }, [loadMore]);

  return (
    <FlashList
      data={conversations}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={80}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyState type="no-conversations" />}
      ListFooterComponent={isLoading ? <LoadingSpinner size="small" /> : null}
      contentContainerStyle={{ paddingVertical: 8 }}
    />
  );
};
```

### Memoization Strategy

```typescript
// React.memo for pure components
import { memo } from 'react';

export const ConversationItem = memo(
  ({ conversation, onPress }: ConversationItemProps) => {
    return (
      <TouchableOpacity onPress={() => onPress(conversation.id)}>
        {/* Conversation content */}
      </TouchableOpacity>
    );
  },
  (prev, next) => {
    return (
      prev.conversation.id === next.conversation.id &&
      prev.conversation.lastMessage?.id === next.conversation.lastMessage?.id &&
      prev.conversation.unreadCount === next.conversation.unreadCount &&
      prev.conversation.updated_at === next.conversation.updated_at
    );
  }
);
```

### Lazy Loading Screens

```typescript
// Lazy-loaded screens (loaded on demand)
import React, { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const ConversationScreen = lazy(() => import('../screens/chat/ConversationScreen'));
const VideoCallScreen = lazy(() => import('../screens/call/VideoCallScreen'));
const EditProfileScreen = lazy(() => import('../screens/profile/EditProfileScreen'));

export const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);
```

### Image Optimization

```typescript
// Progressive image loading with blur hash placeholders
import React from 'react';
import { Image, View } from 'react-native';
import { BlurView } from 'expo-blur';

interface ProgressiveImageProps {
  source: { uri: string };
  blurHash?: string;
  style: any;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  source,
  blurHash,
  style,
}) => {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <View style={style}>
      {blurHash && !loaded && (
        <BlurView intensity={20} style={style} />
      )}
      <Image
        source={source}
        style={[style, { opacity: loaded ? 1 : 0 }]}
        resizeMode="cover"
        onLoad={() => setLoaded(true)}
      />
    </View>
  );
};
```

### Performance Monitoring

```typescript
// src/utils/performance.ts
import { PerformanceObserver, performance } from 'perf_hooks';
import * as Sentry from '@sentry/react-native';

export const performanceMonitor = {
  startTrace(name: string): () => void {
    const startTime = performance.now();
    const trace = Sentry.startTransaction({ name, op: 'task' });

    return () => {
      const duration = performance.now() - startTime;
      trace.setData('duration_ms', duration);
      trace.finish();

      if (duration > 1000) {
        console.warn(`[Performance] Slow operation: ${name} took ${duration.toFixed(0)}ms`);
      }
    };
  },

  measureRender(componentName: string): void {
    const startTime = performance.now();

    requestAnimationFrame(() => {
      const duration = performance.now() - startTime;
      if (duration > 16) { // More than one frame (60fps)
        console.warn(`[Performance] Slow render: ${componentName} took ${duration.toFixed(0)}ms`);
      }
    });
  },

  profileInteraction(interactionName: string): void {
    const startTime = performance.now();

    return {
      end: () => {
        const duration = performance.now() - startTime;
        Sentry.addBreadcrumb({
          category: 'interaction',
          message: interactionName,
          data: { duration_ms: duration },
          level: 'info',
        });
      },
    };
  },
};
```

### Bundle Size Optimization

```typescript
// Code splitting by feature
// metro.config.js optimization
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: true,
        inlineRequires: true, // Enable inline requires for better startup
      },
    }),
  },
};

// Tree-shaking configuration in babel.config.js
module.exports = {
  plugins: [
    ['module:react-native-reanimated/plugin'],
    ['@babel/plugin-transform-flow-strip-types'],
  ],
};
```
---

## 15. Testing Approach

### Testing Strategy Overview

```
+-------------------+     +-------------------+     +-------------------+
|   Unit Tests      | --> |   Integration     | --> |   E2E Tests       |
|   (Jest)          |     |   Tests (RNTL)    |     |   (Detox)         |
|   70% coverage    |     |   Key flows       |     |   Critical paths  |
+-------------------+     +-------------------+     +-------------------+
```

### Unit Tests (Jest + React Native Testing Library)

```typescript
// __tests__/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { apiClient } from '../../src/services/api/apiClient';
import { useAppStore } from '../../src/store';

jest.mock('../../src/services/api/apiClient');
jest.mock('../../src/services/storage/biometricAuth');

describe('useAuth', () => {
  beforeEach(() => {
    useAppStore.getState().logout();
  });

  it('should login successfully with email and password', async () => {
    const mockResponse = {
      data: {
        user: { id: '1', email: 'test@example.com', display_name: 'Test' },
        token: 'mock-token',
        refreshToken: 'mock-refresh',
      },
    };

    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('test@example.com');
  });

  it('should handle login failure', async () => {
    (apiClient.post as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('wrong@example.com', 'wrongpass');
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');
  });

  it('should logout and clear state', async () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
```

### Component Tests

```typescript
// __tests__/components/ChatBubble.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ChatBubble } from '../../src/components/chat/ChatBubble';
import { Message } from '../../src/types/chat';

const mockMessage: Message = {
  id: '1',
  conversation_id: 'conv-1',
  sender_id: 'user-1',
  content: 'Hello, how are you?',
  type: 'text',
  status: 'sent',
  created_at: '2026-07-15T10:30:00Z',
};

describe('ChatBubble', () => {
  it('renders message content correctly', () => {
    render(<ChatBubble message={mockMessage} isOwn={false} />);

    expect(screen.getByText('Hello, how are you?')).toBeTruthy();
  });

  it('applies correct styles for own messages', () => {
    render(<ChatBubble message={mockMessage} isOwn={true} />);

    const bubble = screen.getByTestId('chat-bubble');
    expect(bubble).toHaveStyle({ backgroundColor: '#FF6B6B' });
  });

  it('applies correct styles for other messages', () => {
    render(<ChatBubble message={mockMessage} isOwn={false} />);

    const bubble = screen.getByTestId('chat-bubble');
    expect(bubble).toHaveStyle({ backgroundColor: '#F0F0F0' });
  });

  it('shows read receipt for sent messages', () => {
    const sentMessage = { ...mockMessage, status: 'read' as const };
    render(<ChatBubble message={sentMessage} isOwn={true} />);

    expect(screen.getByTestId('read-receipt')).toBeTruthy();
  });

  it('calls onLongPress when long pressed', () => {
    const onLongPress = jest.fn();
    render(
      <ChatBubble message={mockMessage} isOwn={false} onLongPress={onLongPress} />
    );

    fireEvent(screen.getByTestId('chat-bubble'), 'onLongPress');
    expect(onLongPress).toHaveBeenCalledWith(mockMessage);
  });
});
```

### Integration Tests

```typescript
// __tests__/screens/ConversationScreen.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConversationScreen } from '../../src/screens/chat/ConversationScreen';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        {component}
      </NavigationContainer>
    </QueryClientProvider>
  );
};

describe('ConversationScreen Integration', () => {
  it('loads and displays messages', async () => {
    server.use(
      http.get('/api/conversations/:id/messages', () => {
        return HttpResponse.json({
          data: [
            { id: '1', content: 'Hello!', sender_id: 'user-2' },
            { id: '2', content: 'Hi there!', sender_id: 'user-1' },
          ],
        });
      })
    );

    renderWithProviders(
      <ConversationScreen route={{ params: { conversationId: 'conv-1' } }} />
    );

    await waitFor(() => {
      expect(screen.getByText('Hello!')).toBeTruthy();
      expect(screen.getByText('Hi there!')).toBeTruthy();
    });
  });

  it('sends a new message', async () => {
    const mockSendMessage = jest.fn();
    server.use(
      http.post('/api/messages', () => {
        mockSendMessage();
        return HttpResponse.json({ data: { id: '3', content: 'New message' } });
      })
    );

    renderWithProviders(
      <ConversationScreen route={{ params: { conversationId: 'conv-1' } }} />
    );

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.changeText(input, 'New message');
    fireEvent.press(screen.getByTestId('send-button'));

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalled();
    });
  });
});
```

### E2E Tests (Detox)

```typescript
// e2e/messaging.e2e.ts
import { by, device, element, expect } from 'detox';

describe('Messaging Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should send a message in a conversation', async () => {
    // Navigate to chats tab
    await element(by.id('tab-chats')).tap();
    await expect(element(by.id('chats-screen'))).toBeVisible();

    // Open a conversation
    await element(by.id('conversation-item-1')).tap();
    await expect(element(by.id('conversation-screen'))).toBeVisible();

    // Type and send a message
    const messageInput = element(by.id('message-input'));
    await messageInput.tap();
    await messageInput.typeText('Hello from E2E test!');
    await element(by.id('send-button')).tap();

    // Verify message appears
    await expect(element(by.text('Hello from E2E test!'))).toBeVisible();
  });

  it('should show typing indicator', async () => {
    await element(by.id('tab-chats')).tap();
    await element(by.id('conversation-item-1')).tap();

    const messageInput = element(by.id('message-input'));
    await messageInput.tap();
    await messageInput.typeText('Typing...');

    // Verify typing indicator is shown (via socket mock)
    await expect(element(by.id('typing-indicator'))).toBeVisible();
  });

  it('should handle incoming call', async () => {
    // Simulate incoming call via mock
    await device.sendToHome();
    await device.launchApp({ newInstance: false });

    // Verify incoming call modal
    await expect(element(by.id('incoming-call-modal'))).toBeVisible();
    await element(by.id('accept-call-button')).tap();

    await expect(element(by.id('video-call-screen'))).toBeVisible();
  });
});
```

### Test Configuration

```typescript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterSetup: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/types/**',
    '!src/constants/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Detox Configuration

```json
// .detoxrc.js
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/OJChat.app',
      build: 'xcodebuild -workspace ios/OJChat.xcworkspace -scheme OJChat -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15 Pro',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_7_API_34',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
};
```

---

## Appendix A: Environment Variables

```bash
# .env
EXPO_PUBLIC_API_URL=https://api.ojchat.app/v1
EXPO_PUBLIC_WS_URL=wss://ws.ojchat.app
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
EXPO_PUBLIC_TURN_USERNAME=ojchat-user
EXPO_PUBLIC_TURN_CREDENTIAL=ojchat-turn-secret
EXPO_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
EXPO_PUBLIC_AMPLITUDE_KEY=your_amplitude_key
```

## Appendix B: Build Profiles

```json
// eas.json
{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "http://localhost:3000/v1",
        "EXPO_PUBLIC_WS_URL": "http://localhost:3001"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://staging-api.ojchat.app/v1",
        "EXPO_PUBLIC_WS_URL": "wss://staging-ws.ojchat.app"
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.ojchat.app/v1",
        "EXPO_PUBLIC_WS_URL": "wss://ws.ojchat.app"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id",
        "ascAppId": "your-app-store-connect-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

## Appendix C: TypeScript Path Aliases

```json
// tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@app/*": ["src/app/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@navigation/*": ["src/navigation/*"],
      "@hooks/*": ["src/hooks/*"],
      "@store/*": ["src/store/*"],
      "@services/*": ["src/services/*"],
      "@database/*": ["src/database/*"],
      "@socket/*": ["src/socket/*"],
      "@webrtc/*": ["src/webrtc/*"],
      "@sync/*": ["src/sync/*"],
      "@notifications/*": ["src/notifications/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@constants/*": ["src/constants/*"],
      "@theme/*": ["src/theme/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

---

*This document is part of the OJChat Software Design Document (SDD) package.*

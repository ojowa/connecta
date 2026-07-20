import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { ConversationScreen } from '../screens/chat/ConversationScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import PhotoManagerScreen from '../screens/profile/PhotoManagerScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SubscriptionScreen from '../screens/subscription/SubscriptionScreen';
import WalletScreen from '../screens/subscription/WalletScreen';
import ReportScreen from '../screens/safety/ReportScreen';
import BlockConfirmation from '../screens/safety/BlockConfirmation';
import SafetyTips from '../screens/safety/SafetyTips';
import IncomingCallScreen from '../screens/call/IncomingCallScreen';
import ActiveVoiceCallScreen from '../screens/call/ActiveVoiceCallScreen';
import ActiveVideoCallScreen from '../screens/call/ActiveVideoCallScreen';
import MatchScreen from '../screens/match/MatchScreen';

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
            {/* Chat */}
            <Stack.Screen name="Conversation" component={ConversationScreen} options={{ headerShown: true, title: 'Chat' }} />
            {/* Profile */}
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: true, title: 'Edit Profile' }} />
            <Stack.Screen name="PhotoManager" component={PhotoManagerScreen} options={{ headerShown: true, title: 'Manage Photos' }} />
            {/* Settings & Notifications */}
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true, title: 'Notifications' }} />
            {/* Subscription */}
            <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: true, title: 'Subscription' }} />
            <Stack.Screen name="Wallet" component={WalletScreen} options={{ headerShown: true, title: 'Wallet' }} />
            {/* Safety */}
            <Stack.Screen name="Report" component={ReportScreen} options={{ headerShown: true, title: 'Report', presentation: 'modal' }} />
            <Stack.Screen name="BlockConfirmation" component={BlockConfirmation} options={{ headerShown: true, title: 'Block User', presentation: 'modal' }} />
            <Stack.Screen name="SafetyTips" component={SafetyTips} options={{ headerShown: true, title: 'Safety Tips' }} />
            {/* Calls */}
            <Stack.Screen name="IncomingCall" component={IncomingCallScreen} options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            <Stack.Screen name="ActiveVoiceCall" component={ActiveVoiceCallScreen} options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            <Stack.Screen name="ActiveVideoCall" component={ActiveVideoCallScreen} options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            {/* Match */}
            <Stack.Screen name="Match" component={MatchScreen} options={{ headerShown: false, presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

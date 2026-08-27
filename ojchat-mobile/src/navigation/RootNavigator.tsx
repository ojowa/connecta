import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { ConversationScreen } from '../screens/chat/ConversationScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import PhotoManagerScreen from '../screens/profile/PhotoManagerScreen';
import ProfilePromptsScreen from '../screens/profile/ProfilePromptsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SubscriptionScreen from '../screens/subscription/SubscriptionScreen';
import WalletScreen from '../screens/subscription/WalletScreen';
import ReportScreen from '../screens/safety/ReportScreen';
import BlockConfirmation from '../screens/safety/BlockConfirmation';
import SafetyTips from '../screens/safety/SafetyTips';
import AppealScreen from '../screens/safety/AppealScreen';
import IncomingCallScreen from '../screens/call/IncomingCallScreen';
import ActiveVoiceCallScreen from '../screens/call/ActiveVoiceCallScreen';
import ActiveVideoCallScreen from '../screens/call/ActiveVideoCallScreen';
import MatchScreen from '../screens/match/MatchScreen';
import LikesYouScreen from '../screens/matches/LikesYouScreen';
import BoostScreen from '../screens/matches/BoostScreen';
import MomentsScreen from '../screens/main/MomentsScreen';
import PreferencesScreen from '../screens/preferences/PreferencesScreen';
import PassportScreen from '../screens/preferences/PassportScreen';
import EditPhoneScreen from '../screens/settings/EditPhoneScreen';
import EditEmailScreen from '../screens/settings/EditEmailScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import TwoFactorAuthScreen from '../screens/settings/TwoFactorAuthScreen';
import DevicesScreen from '../screens/settings/DevicesScreen';
import QuietHoursScreen from '../screens/settings/QuietHoursScreen';
import BlockListScreen from '../screens/settings/BlockListScreen';
import ReportProblemScreen from '../screens/settings/ReportProblemScreen';
import IncognitoScreen from '../screens/settings/IncognitoScreen';
import { BiometricSetupScreen } from '../screens/auth/BiometricSetupScreen';
import { InterestSelectorScreen } from '../screens/profile/InterestSelectorScreen';
import { VerificationScreen } from '../screens/profile/VerificationScreen';
import { WhoViewedScreen } from '../screens/matches/WhoViewedScreen';
import { MyLikesScreen } from '../screens/matches/MyLikesScreen';
import { UserProfileScreen } from '../screens/profile/UserProfileScreen';
import { DailyStreakScreen } from '../screens/gamification/DailyStreakScreen';

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
            <Stack.Screen name="InterestSelector" component={InterestSelectorScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PhotoManager" component={PhotoManagerScreen} options={{ headerShown: true, title: 'Manage Photos' }} />
            <Stack.Screen name="ProfilePrompts" component={ProfilePromptsScreen} options={{ headerShown: true, title: 'Profile Prompts' }} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Verification" component={VerificationScreen} options={{ headerShown: true, title: 'Verify Profile' }} />
            {/* Settings & Notifications */}
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings' }} />
            <Stack.Screen name="Preferences" component={PreferencesScreen} options={{ headerShown: true, title: 'Preferences' }} />
            <Stack.Screen name="Passport" component={PassportScreen} options={{ headerShown: true, title: 'Passport' }} />
            <Stack.Screen name="EditPhone" component={EditPhoneScreen} options={{ headerShown: true, title: 'Edit Phone' }} />
            <Stack.Screen name="EditEmail" component={EditEmailScreen} options={{ headerShown: true, title: 'Edit Email' }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: true, title: 'Change Password' }} />
            <Stack.Screen name="BiometricSetup" component={BiometricSetupScreen} options={{ headerShown: true, title: 'Biometric Login' }} />
            <Stack.Screen name="TwoFactorAuth" component={TwoFactorAuthScreen} options={{ headerShown: true, title: 'Two-Factor Auth' }} />
            <Stack.Screen name="Devices" component={DevicesScreen} options={{ headerShown: true, title: 'Devices' }} />
            <Stack.Screen name="QuietHours" component={QuietHoursScreen} options={{ headerShown: true, title: 'Quiet Hours' }} />
            <Stack.Screen name="BlockList" component={BlockListScreen} options={{ headerShown: true, title: 'Block List' }} />
            <Stack.Screen name="Incognito" component={IncognitoScreen} options={{ headerShown: true, title: 'Incognito Mode' }} />
            <Stack.Screen name="ReportProblem" component={ReportProblemScreen} options={{ headerShown: true, title: 'Report a Problem' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true, title: 'Notifications' }} />
            {/* Subscription */}
            <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: true, title: 'Subscription' }} />
            <Stack.Screen name="Wallet" component={WalletScreen} options={{ headerShown: true, title: 'Wallet' }} />
            <Stack.Screen name="Boost" component={BoostScreen} options={{ headerShown: true, title: 'Boost' }} />
            {/* Matches & Social */}
            <Stack.Screen name="LikesYou" component={LikesYouScreen} options={{ headerShown: true, title: 'Likes You' }} />
            <Stack.Screen name="MyLikes" component={MyLikesScreen} options={{ headerShown: false }} />
            <Stack.Screen name="WhoViewed" component={WhoViewedScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Moments" component={MomentsScreen} options={{ headerShown: true, title: 'Moments' }} />
            <Stack.Screen name="DailyStreak" component={DailyStreakScreen} options={{ headerShown: false }} />
            {/* Safety */}
            <Stack.Screen name="Report" component={ReportScreen} options={{ headerShown: true, title: 'Report', presentation: 'modal' }} />
            <Stack.Screen name="BlockConfirmation" component={BlockConfirmation} options={{ headerShown: true, title: 'Block User', presentation: 'modal' }} />
            <Stack.Screen name="SafetyTips" component={SafetyTips} options={{ headerShown: true, title: 'Safety Tips' }} />
            <Stack.Screen name="Appeal" component={AppealScreen} options={{ headerShown: true, title: 'Appeal', presentation: 'modal' }} />
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

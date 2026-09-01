import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Conversation: {
    conversationId?: string;
    otherUserId: string;
    otherName?: string;
    otherAvatar?: string;
    initialMessage?: string;
  };
  EditProfile: undefined;
  InterestSelector: undefined;
  PhotoManager: undefined;
  ProfilePrompts: undefined;
  UserProfile: { userId: string; isMatched?: boolean };
  Verification: undefined;
  Settings: undefined;
  Preferences: undefined;
  Passport: undefined;
  EditPhone: undefined;
  EditEmail: undefined;
  ChangePassword: undefined;
  BiometricSetup: undefined;
  TwoFactorAuth: undefined;
  Devices: undefined;
  QuietHours: undefined;
  BlockList: undefined;
  Incognito: undefined;
  ReportProblem: undefined;
  Notifications: undefined;
  Subscription: undefined;
  Wallet: undefined;
  Boost: undefined;
  LikesYou: undefined;
  MyLikes: undefined;
  WhoViewed: undefined;
  Moments: undefined;
  DailyStreak: undefined;
  Report: { userId: string };
  BlockConfirmation: { userId: string; fullName?: string };
  SafetyTips: undefined;
  Appeal: undefined;
  IncomingCall: {
    callId: string;
    callerId: string;
    callerName?: string;
    callerAvatar?: string;
    callType: 'voice' | 'video';
  };
  ActiveVoiceCall: {
    callerId: string;
    callerName?: string;
    callerAvatar?: string;
    conversationId?: string;
    callType: 'voice' | 'video';
  };
  ActiveVideoCall: {
    callerId: string;
    callerName?: string;
    callerAvatar?: string;
    conversationId?: string;
    callType: 'voice' | 'video';
  };
  Match: {
    matchedUser: { userId: string; fullName: string; avatar?: string };
    conversationId?: string;
  };
};

export type MainTabParamList = {
  Discover: undefined;
  Matches: undefined;
  Chats: undefined;
  Profile: undefined;
  Moments: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

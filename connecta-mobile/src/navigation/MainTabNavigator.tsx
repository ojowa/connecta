import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DiscoverScreen } from '../screens/main/DiscoverScreen';
import { MatchesScreen } from '../screens/main/MatchesScreen';
import { ChatsScreen } from '../screens/main/ChatsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { useAppStore } from '../store';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export const MainTabNavigator: React.FC = () => {
  const totalUnread = useAppStore((s) => s.totalUnread);
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.gray400, tabBarStyle: { paddingBottom: 8, height: 60 } }}>
      <Tab.Screen name="Discover" component={DiscoverScreen} options={{ tabBarLabel: 'Discover' }} />
      <Tab.Screen name="Matches" component={MatchesScreen} options={{ tabBarLabel: 'Matches' }} />
      <Tab.Screen name="Chats" component={ChatsScreen} options={{ tabBarLabel: 'Chats', tabBarBadge: totalUnread > 0 ? totalUnread : undefined }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DiscoverScreen } from '../screens/main/DiscoverScreen';
import { MatchesScreen } from '../screens/main/MatchesScreen';
import { ChatsScreen } from '../screens/main/ChatsScreen';
import MomentsScreen from '../screens/main/MomentsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { useAppStore } from '../store';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const TabIcon: React.FC<{ emoji: string; focused: boolean; color: string }> = ({ emoji, focused, color }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

export const MainTabNavigator: React.FC = () => {
  const totalUnread = useAppStore((s) => s.totalUnread);
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: { paddingBottom: Math.max(insets.bottom, 8), height: 60 + Math.max(insets.bottom - 8, 0) },
      }}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="🔥" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{
          tabBarLabel: 'Matches',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="💜" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="💬" focused={focused} color={color} />,
          tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
        }}
      />
      <Tab.Screen
        name="Moments"
        component={MomentsScreen}
        options={{
          tabBarLabel: 'Moments',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="✨" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="👤" focused={focused} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

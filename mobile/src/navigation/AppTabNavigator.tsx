import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Compass, Users, Bell, User } from 'lucide-react-native';
import { AppTabParamList } from './types';
import { DiscoverNavigator } from './DiscoverNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { TeamsNavigator } from './TeamsNavigator';
import { HackathonsNavigator } from './HackathonsNavigator';
import { NotificationsNavigator } from './NotificationsNavigator';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator<AppTabParamList>();

export const AppTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="DiscoverTab"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: {
          ...typography.label,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverNavigator}
        options={{
          tabBarLabel: 'HOME',
          tabBarIcon: ({ color }) => <Home color={color} size={20} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="HackathonsTab"
        component={HackathonsNavigator}
        options={{
          tabBarLabel: 'HACKS',
          tabBarIcon: ({ color }) => <Compass color={color} size={20} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="TeamsTab"
        component={TeamsNavigator}
        options={{
          tabBarLabel: 'TEAMS',
          tabBarIcon: ({ color }) => <Users color={color} size={20} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsNavigator}
        options={{
          tabBarLabel: 'ALERTS',
          tabBarIcon: ({ color }) => <Bell color={color} size={20} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'PROFILE',
          tabBarIcon: ({ color }) => <User color={color} size={20} strokeWidth={1.5} />,
        }}
      />
    </Tab.Navigator>
  );
};

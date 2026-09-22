import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
          borderTopColor: colors.surfaceBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          ...typography.captionBold,
          fontSize: 11,
        },
      }}
    >
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverNavigator}
        options={{ tabBarLabel: 'Discover' }}
      />
      <Tab.Screen
        name="TeamsTab"
        component={TeamsNavigator}
        options={{ tabBarLabel: 'Teams' }}
      />
      <Tab.Screen
        name="HackathonsTab"
        component={HackathonsNavigator}
        options={{ tabBarLabel: 'Hackathons' }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsNavigator}
        options={{ tabBarLabel: 'Alerts' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

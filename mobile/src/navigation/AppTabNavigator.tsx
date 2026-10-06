import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppTabParamList } from './types';
import { DiscoverNavigator } from './DiscoverNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { TeamsNavigator } from './TeamsNavigator';
import { HackathonsNavigator } from './HackathonsNavigator';
import { NotificationsNavigator } from './NotificationsNavigator';
import { colors, typography } from '../theme';
import { Icon } from '../components/ui';

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
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.secondaryLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          ...typography.captionBold,
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverNavigator}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color, size }) => <Icon name="discover" color={color} size={size || 22} />,
        }}
      />
      <Tab.Screen
        name="TeamsTab"
        component={TeamsNavigator}
        options={{
          tabBarLabel: 'Teams',
          tabBarIcon: ({ color, size }) => <Icon name="teams" color={color} size={size || 22} />,
        }}
      />
      <Tab.Screen
        name="HackathonsTab"
        component={HackathonsNavigator}
        options={{
          tabBarLabel: 'Hackathons',
          tabBarIcon: ({ color, size }) => <Icon name="hackathons" color={color} size={size || 22} />,
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsNavigator}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => <Icon name="notifications" color={color} size={size || 22} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Icon name="profile" color={color} size={size || 22} />,
        }}
      />
    </Tab.Navigator>
  );
};

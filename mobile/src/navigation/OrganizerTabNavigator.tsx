import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { OrganizerTabParamList } from './types';
import { OrganizerHackathonsScreen } from '../screens/organizer/OrganizerHackathonsScreen';
import { OrganizerSquadsScreen } from '../screens/organizer/OrganizerSquadsScreen';
import { OrganizerBroadcastScreen } from '../screens/organizer/OrganizerBroadcastScreen';
import { OrganizerProfileScreen } from '../screens/organizer/OrganizerProfileScreen';
import { colors, typography } from '../theme';
import { Icon } from '../components/ui';

const Tab = createBottomTabNavigator<OrganizerTabParamList>();

export const OrganizerTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="ManageTab"
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
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          ...typography.captionBold,
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="ManageTab"
        component={OrganizerHackathonsScreen}
        options={{
          tabBarLabel: 'Manage',
          tabBarIcon: ({ color, size }) => <Icon name="hackathons" color={color} size={size || 22} />,
        }}
      />
      <Tab.Screen
        name="SquadsTab"
        component={OrganizerSquadsScreen}
        options={{
          tabBarLabel: 'Squads',
          tabBarIcon: ({ color, size }) => <Icon name="teams" color={color} size={size || 22} />,
        }}
      />
      <Tab.Screen
        name="BroadcastTab"
        component={OrganizerBroadcastScreen}
        options={{
          tabBarLabel: 'Broadcast',
          tabBarIcon: ({ color, size }) => <Icon name="notifications" color={color} size={size || 22} />,
        }}
      />
      <Tab.Screen
        name="OrganizerProfileTab"
        component={OrganizerProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Icon name="profile" color={color} size={size || 22} />,
        }}
      />
    </Tab.Navigator>
  );
};

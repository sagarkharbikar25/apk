import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, PlusSquare, Bell, User } from 'lucide-react-native';
import { OrganizerTabParamList } from './types';
import { OrganizerHackathonsScreen } from '../screens/organizer/OrganizerHackathonsScreen';
import { OrganizerSquadsScreen } from '../screens/organizer/OrganizerSquadsScreen';
import { OrganizerBroadcastScreen } from '../screens/organizer/OrganizerBroadcastScreen';
import { OrganizerProfileScreen } from '../screens/organizer/OrganizerProfileScreen';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator<OrganizerTabParamList>();

export const OrganizerTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="ManageTab"
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
        name="ManageTab"
        component={OrganizerHackathonsScreen}
        options={{
          tabBarLabel: 'HUB',
          tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={20} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="SquadsTab"
        component={OrganizerSquadsScreen}
        options={{
          tabBarLabel: 'CREATE',
          tabBarIcon: ({ color }) => <PlusSquare color={color} size={20} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="BroadcastTab"
        component={OrganizerBroadcastScreen}
        options={{
          tabBarLabel: 'ALERTS',
          tabBarIcon: ({ color }) => <Bell color={color} size={20} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="OrganizerProfileTab"
        component={OrganizerProfileScreen}
        options={{
          tabBarLabel: 'PROFILE',
          tabBarIcon: ({ color }) => <User color={color} size={20} strokeWidth={1.5} />,
        }}
      />
    </Tab.Navigator>
  );
};

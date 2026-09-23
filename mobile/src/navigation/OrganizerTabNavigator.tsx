import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { OrganizerTabParamList } from './types';
import { OrganizerHackathonsScreen } from '../screens/organizer/OrganizerHackathonsScreen';
import { OrganizerSquadsScreen } from '../screens/organizer/OrganizerSquadsScreen';
import { OrganizerBroadcastScreen } from '../screens/organizer/OrganizerBroadcastScreen';
import { OrganizerProfileScreen } from '../screens/organizer/OrganizerProfileScreen';
import { colors, typography } from '../theme';
import { Icon } from '../components/ui';

const Tab = createBottomTabNavigator<OrganizerTabParamList>();

const TabBarIndicator: React.FC<{ focused: boolean; color: string }> = ({
  focused,
  color,
}) => {
  if (!focused) return null;
  return <View style={[styles.activeIndicator, { backgroundColor: color }]} />;
};

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
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.organizer,
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
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconWrap}>
              <Icon name="hackathons" color={color} size={size || 22} />
              <TabBarIndicator focused={focused} color={colors.organizer} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="SquadsTab"
        component={OrganizerSquadsScreen}
        options={{
          tabBarLabel: 'Squads',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconWrap}>
              <Icon name="teams" color={color} size={size || 22} />
              <TabBarIndicator focused={focused} color={colors.organizer} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="BroadcastTab"
        component={OrganizerBroadcastScreen}
        options={{
          tabBarLabel: 'Broadcast',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconWrap}>
              <Icon name="notifications" color={color} size={size || 22} />
              <TabBarIndicator focused={focused} color={colors.organizer} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="OrganizerProfileTab"
        component={OrganizerProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconWrap}>
              <Icon name="profile" color={color} size={size || 22} />
              <TabBarIndicator focused={focused} color={colors.organizer} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 30,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 18,
    height: 2,
    borderRadius: 1,
  },
});

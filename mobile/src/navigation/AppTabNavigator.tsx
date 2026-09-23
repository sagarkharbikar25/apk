import React from 'react';
import { View, StyleSheet } from 'react-native';
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

const TabBarIndicator: React.FC<{ focused: boolean; color: string }> = ({
  focused,
  color,
}) => {
  if (!focused) return null;
  return <View style={[styles.activeIndicator, { backgroundColor: color }]} />;
};

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
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.student,
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
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconWrap}>
              <Icon name="discover" color={color} size={size || 22} />
              <TabBarIndicator focused={focused} color={colors.student} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="TeamsTab"
        component={TeamsNavigator}
        options={{
          tabBarLabel: 'Teams',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconWrap}>
              <Icon name="teams" color={color} size={size || 22} />
              <TabBarIndicator focused={focused} color={colors.student} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="HackathonsTab"
        component={HackathonsNavigator}
        options={{
          tabBarLabel: 'Hackathons',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconWrap}>
              <Icon name="hackathons" color={color} size={size || 22} />
              <TabBarIndicator focused={focused} color={colors.student} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsNavigator}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconWrap}>
              <Icon name="notifications" color={color} size={size || 22} />
              <TabBarIndicator focused={focused} color={colors.student} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconWrap}>
              <Icon name="profile" color={color} size={size || 22} />
              <TabBarIndicator focused={focused} color={colors.student} />
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

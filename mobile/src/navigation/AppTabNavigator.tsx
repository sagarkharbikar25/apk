import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppTabParamList } from './types';
import { DiscoverNavigator } from './DiscoverNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { colors, typography } from '../theme';

// Placeholder stubs for Branch 2 (Member 4 UI Ownership)
// These allow Branch 1 to compile and run seamlessly without touching Branch 2 code!
const TeamsPlaceholder: React.FC = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Teams & QR Module</Text>
    <Text style={styles.placeholderSubtitle}>
      Managed by Member 4 on feature/rn-teams-notifications
    </Text>
  </View>
);

const HackathonsPlaceholder: React.FC = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Hackathons Catalog</Text>
    <Text style={styles.placeholderSubtitle}>
      Managed by Member 4 on feature/rn-teams-notifications
    </Text>
  </View>
);

const NotificationsPlaceholder: React.FC = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Notifications Center</Text>
    <Text style={styles.placeholderSubtitle}>
      Managed by Member 4 on feature/rn-teams-notifications
    </Text>
  </View>
);

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
        component={TeamsPlaceholder}
        options={{ tabBarLabel: 'Teams' }}
      />
      <Tab.Screen
        name="HackathonsTab"
        component={HackathonsPlaceholder}
        options={{ tabBarLabel: 'Hackathons' }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsPlaceholder}
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

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  placeholderTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  placeholderSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

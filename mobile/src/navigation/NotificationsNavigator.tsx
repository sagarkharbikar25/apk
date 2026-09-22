import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export const NotificationsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="NotificationsList" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

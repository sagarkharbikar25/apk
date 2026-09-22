import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DiscoverStackParamList } from './types';
import { DiscoverScreen } from '../screens/discover/DiscoverScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export const DiscoverNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="DiscoverList"
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="DiscoverList"
        component={DiscoverScreen}
        options={{ title: 'Discover & Matchmaking' }}
      />
    </Stack.Navigator>
  );
};

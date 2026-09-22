import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HackathonsListScreen } from '../screens/hackathons/HackathonsListScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export const HackathonsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="HackathonsList" component={HackathonsListScreen} />
    </Stack.Navigator>
  );
};

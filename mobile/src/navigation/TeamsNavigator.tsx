import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TeamsStackParamList } from './types';
import { TeamsListScreen } from '../screens/teams/TeamsListScreen';
import { TeamDetailScreen } from '../screens/teams/TeamDetailScreen';
import { CreateTeamScreen } from '../screens/teams/CreateTeamScreen';
import { QRScannerScreen } from '../screens/teams/QRScannerScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<TeamsStackParamList>();

export const TeamsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="TeamsList"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="TeamsList" component={TeamsListScreen} />
      <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />
      <Stack.Screen name="CreateTeam" component={CreateTeamScreen} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} />
    </Stack.Navigator>
  );
};

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './types';
import { ProfileViewScreen } from '../screens/profile/ProfileViewScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { SkillsManageScreen } from '../screens/profile/SkillsManageScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProfileView"
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="ProfileView"
        component={ProfileViewScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="SkillsManage"
        component={SkillsManageScreen}
        options={{ title: 'Manage Skills' }}
      />
    </Stack.Navigator>
  );
};

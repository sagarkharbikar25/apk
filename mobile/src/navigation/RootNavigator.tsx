import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { AppTabNavigator } from './AppTabNavigator';
import { SplashScreen } from '../screens/splash/SplashScreen';
import { LoadingScreen } from '../components/ui';

export const RootNavigator: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, isLoading } = useAuthStore();

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (isLoading) {
    return (
      <LoadingScreen
        message="Connecting to SkillSync..."
        subtitle="Verifying credentials & loading your campus network"
      />
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

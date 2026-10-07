import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';
import { OfflineBanner } from './src/components/offline/OfflineBanner';

LogBox.ignoreAllLogs(true);

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <OfflineBanner />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default App;

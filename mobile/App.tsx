import React from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ComponentGallery } from './src/screens/dev/ComponentGallery';

LogBox.ignoreAllLogs(true);

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ComponentGallery />
    </SafeAreaProvider>
  );
}

export default App;

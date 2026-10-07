import React from 'react';
import { View, StyleSheet, StatusBar, ViewProps } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { DigitRain } from './DigitRain';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  withRain?: 'animated' | 'static' | 'none';
  unsafe?: boolean;
}

export const Screen = ({ 
  children, 
  withRain = 'none', 
  unsafe = false,
  style, 
  ...props 
}: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const Container = unsafe ? View : SafeAreaView;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      
      {withRain !== 'none' && (
        <DigitRain animated={withRain === 'animated'} />
      )}
      
      <Container 
        style={[styles.container, unsafe && { paddingTop: insets.top, paddingBottom: insets.bottom }, style]} 
        {...props}
      >
        {children}
      </Container>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
  },
});

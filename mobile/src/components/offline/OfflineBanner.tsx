import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '../../theme';

export const OfflineBanner = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.text}>// OFFLINE — SHOWING SAVED DATA</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    paddingBottom: 8,
    paddingTop: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    ...typography.micro,
    color: colors.warn,
  },
});

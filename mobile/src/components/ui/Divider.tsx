import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors } from '../../theme';

export const Divider = ({ style, ...props }: ViewProps) => {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.line} />
      <View style={styles.diamond} />
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  diamond: {
    width: 6,
    height: 6,
    backgroundColor: colors.accent,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 12,
  },
});

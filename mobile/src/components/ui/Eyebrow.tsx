import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { colors, typography } from '../../theme';

interface EyebrowProps extends ViewProps {
  label: string;
}

export const Eyebrow = ({ label, style, ...props }: EyebrowProps) => {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.dot} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: colors.accent,
    marginRight: 8,
  },
  text: {
    ...typography.micro,
    color: colors.text,
  },
});

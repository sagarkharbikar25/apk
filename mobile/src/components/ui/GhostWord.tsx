import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import { colors, typography } from '../../theme';

interface GhostWordProps extends TextProps {
  word: string;
}

export const GhostWord = ({ word, style, ...props }: GhostWordProps) => {
  return (
    <Text 
      style={[styles.ghost, style]} 
      pointerEvents="none" 
      numberOfLines={1}
      {...props}
    >
      {word}
    </Text>
  );
};

const styles = StyleSheet.create({
  ghost: {
    ...typography.displayXL,
    position: 'absolute',
    top: '10%',
    left: -20,
    fontSize: 120, // Giant display text
    lineHeight: 120,
    color: colors.text,
    opacity: 0.04,
  },
});

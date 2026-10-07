import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import { colors, typography } from '../../theme';

interface HeadlineProps extends TextProps {
  children: React.ReactNode;
  accent?: string;
}

export const Headline = ({ children, accent, style, ...props }: HeadlineProps) => {
  return (
    <Text style={[typography.displayL, styles.base, style]} {...props}>
      {children}
      {accent && (
        <Text style={styles.accent}> {accent}</Text>
      )}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    color: colors.text,
  },
  accent: {
    color: colors.accent,
    textShadowColor: colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});

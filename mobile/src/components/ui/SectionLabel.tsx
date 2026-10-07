import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import { colors, typography } from '../../theme';

interface SectionLabelProps extends TextProps {
  label: string;
}

export const SectionLabel = ({ label, style, ...props }: SectionLabelProps) => {
  return (
    <Text style={[typography.micro, styles.label, style]} {...props}>
      {'// '}{label}
    </Text>
  );
};

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    marginBottom: 16,
  },
});

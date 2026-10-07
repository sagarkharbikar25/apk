import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { colors, typography } from '../../theme';

interface BrandProps extends ViewProps {
  size?: 'large' | 'medium' | 'small';
}

export const Brand = ({ size = 'medium', style, ...props }: BrandProps) => {
  let textStyle;
  switch (size) {
    case 'large':
      textStyle = typography.displayL;
      break;
    case 'small':
      textStyle = typography.title;
      break;
    case 'medium':
    default:
      textStyle = typography.displayM;
      break;
  }

  return (
    <View style={[styles.container, style]} {...props}>
      <Text style={[textStyle, styles.text]}>
        SKILLSYNC<Text style={styles.dot}>.</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: colors.text,
  },
  dot: {
    color: colors.accent,
  },
});

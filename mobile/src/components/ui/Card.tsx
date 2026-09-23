import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors, borderRadius } from '../../theme';

export type CardVariant = 'default' | 'elevated' | 'outlined';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: CardVariant;
  onPress?: () => void;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  onPress,
  testID,
}) => {
  const cardStyles = [
    styles.base,
    styles[variant],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={cardStyles}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface, // #16181C
    borderRadius: borderRadius.md,
    paddingVertical: 18, // ~20% increased vertical breathing room
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder, // #24262B
  },
  default: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
  },
  elevated: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: colors.surfaceBorder,
  },
});

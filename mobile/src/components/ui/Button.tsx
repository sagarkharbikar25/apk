import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated, PressableProps, ViewStyle, TextStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors, typography } from '../../theme';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'outline' | 'ghost';
  icon?: LucideIcon;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const Button = ({ 
  label, 
  variant = 'primary', 
  icon: Icon, 
  style, 
  labelStyle,
  ...props 
}: ButtonProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.timing(scale, {
      toValue: 0.98,
      duration: 120,
      useNativeDriver: true,
    }).start();
    if (props.onPressIn) props.onPressIn(e);
  };

  const handlePressOut = (e: any) => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
    if (props.onPressOut) props.onPressOut(e);
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.base,
          styles[variant],
          pressed && styles[`${variant}Pressed`],
          props.disabled && styles.disabled,
          style,
        ]}
      >
        {Icon && (
          <Icon 
            size={20} 
            color={variant === 'primary' ? '#FFFFFF' : colors.accent} 
            style={styles.icon}
          />
        )}
        <Text style={[
          styles.label, 
          variant === 'primary' ? styles.primaryLabel : styles.accentLabel,
          props.disabled && styles.disabledLabel,
          labelStyle
        ]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: colors.accentSolid,
  },
  primaryPressed: {
    backgroundColor: '#C00F3E', // Darker shade of accentSolid
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  outlinePressed: {
    backgroundColor: colors.accentDim,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostPressed: {
    backgroundColor: colors.surface2,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontFamily: typography.label.fontFamily, // Rajdhani-SemiBold
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    includeFontPadding: false,
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
  accentLabel: {
    color: colors.accent,
  },
  disabledLabel: {
    // Keep base color but container opacity drops
  }
});

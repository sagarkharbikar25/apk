import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Animated,
  Platform,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  isPassword = false,
  secureTextEntry,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  const isSecured = isPassword ? !showPassword : secureTextEntry;

  useEffect(() => {
    if (isFocused) {
      // Fade in glow
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();

      // Start subtle pulse loop
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
        ]),
      );
      pulseRef.current = pulse;
      pulse.start();
    } else {
      // Stop pulse and fade out glow
      pulseRef.current?.stop();
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused, glowAnim, pulseAnim]);

  const glowOpacity = Animated.multiply(glowAnim, pulseAnim);

  const animatedBorderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? colors.error : colors.inputBorder, error ? colors.error : colors.studentAccent],
  });

  const animatedShadowOpacity = glowOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Animated.View
        style={[
          styles.inputContainer,
          error ? styles.inputError : null,
          {
            borderColor: animatedBorderColor,
            ...(Platform.OS === 'ios'
              ? {
                  shadowColor: error ? colors.error : colors.studentAccent,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: animatedShadowOpacity as unknown as number,
                  shadowRadius: 10,
                }
              : {}),
          },
          Platform.OS === 'android' && isFocused && !error
            ? styles.androidGlow
            : null,
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={colors.inputPlaceholder}
          secureTextEntry={isSecured}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Text style={styles.eyeText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
          </TouchableOpacity>
        )}

        {!isPassword && rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </Animated.View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground, // #16181C
    borderWidth: 1.5,
    borderColor: colors.inputBorder, // #24262B
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    minHeight: 46,
  },
  inputError: {
    borderColor: colors.error,
  },
  androidGlow: {
    elevation: 8,
    shadowColor: colors.studentAccent,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary, // #EDEFF2
    paddingVertical: spacing.sm,
  },
  iconContainer: {
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  eyeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});


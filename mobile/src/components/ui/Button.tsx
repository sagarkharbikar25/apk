import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'student'
  | 'organizer'
  | 'outline'
  | 'outlineOrganizer'
  | 'link'
  | 'ghost'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  const getSpinnerColor = () => {
    if (variant === 'primary' || variant === 'student' || variant === 'organizer') {
      return colors.textDark;
    }
    if (variant === 'outlineOrganizer' || variant === 'secondary') return colors.organizer;
    if (variant === 'outline' || variant === 'link') return colors.student;
    return colors.textPrimary;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={getSpinnerColor()} />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.textBase,
              styles[`text_${variant}`],
              styles[`textSize_${size}`],
              isDisabled && styles.textDisabled,
              leftIcon ? { marginLeft: spacing.sm } : null,
              rightIcon ? { marginRight: spacing.sm } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
  // ── Sizes ───────────────────────────────────────────────────────
  size_sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 34,
  },
  size_md: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  size_lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
  },
  // ── Variants (Quiet Focus: Flat accents, minimal secondary) ────
  primary: {
    backgroundColor: colors.student, // Solid Mint #6EE7C4
  },
  student: {
    backgroundColor: colors.student, // Solid Mint #6EE7C4
  },
  secondary: {
    backgroundColor: colors.organizer, // Solid Amber #E8B25E
  },
  organizer: {
    backgroundColor: colors.organizer, // Solid Amber #E8B25E
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  outlineOrganizer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  link: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  danger: {
    backgroundColor: colors.error, // Soft Coral
  },
  disabled: {
    opacity: 0.4,
  },
  // ── Typography ──────────────────────────────────────────────────
  textBase: {
    ...typography.button,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textSize_sm: {
    fontSize: 13,
  },
  textSize_md: {
    fontSize: 14,
  },
  textSize_lg: {
    fontSize: 16,
  },
  text_primary: {
    color: colors.textDark, // #0E0F12
  },
  text_student: {
    color: colors.textDark,
  },
  text_secondary: {
    color: colors.textDark, // #0E0F12
  },
  text_organizer: {
    color: colors.textDark,
  },
  text_outline: {
    color: colors.student,
    fontWeight: '500',
  },
  text_outlineOrganizer: {
    color: colors.organizer,
    fontWeight: '500',
  },
  text_link: {
    color: colors.student,
    fontWeight: '500',
  },
  text_ghost: {
    color: colors.textSecondary,
  },
  text_danger: {
    color: colors.textDark,
  },
  textDisabled: {
    color: colors.textMuted,
  },
});

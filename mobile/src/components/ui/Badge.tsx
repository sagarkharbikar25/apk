import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  onPress?: () => void;
  onRemove?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  onPress,
  onRemove,
  style,
  textStyle,
}) => {
  const content = (
    <View
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          styles[`text_${variant}`],
          styles[`textSize_${size}`],
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.removeBtn}
        >
          <Text style={[styles.removeText, styles[`text_${variant}`]]}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  size_sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  size_md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  // Variants
  primary: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  secondary: {
    backgroundColor: colors.secondarySubtle,
    borderColor: colors.secondary,
    borderWidth: 1,
  },
  success: {
    backgroundColor: colors.successSubtle,
    borderColor: colors.success,
    borderWidth: 1,
  },
  warning: {
    backgroundColor: colors.warningSubtle,
    borderColor: colors.warning,
    borderWidth: 1,
  },
  error: {
    backgroundColor: colors.errorSubtle,
    borderColor: colors.error,
    borderWidth: 1,
  },
  muted: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
  },
  // Text
  text: {
    ...typography.captionBold,
  },
  textSize_sm: {
    fontSize: 11,
    lineHeight: 14,
  },
  textSize_md: {
    fontSize: 12,
    lineHeight: 16,
  },
  text_primary: {
    color: colors.primaryLight,
  },
  text_secondary: {
    color: colors.secondaryLight,
  },
  text_success: {
    color: colors.success,
  },
  text_warning: {
    color: colors.warning,
  },
  text_error: {
    color: colors.error,
  },
  text_muted: {
    color: colors.textSecondary,
  },
  removeBtn: {
    marginLeft: spacing.xs,
  },
  removeText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 14,
  },
});

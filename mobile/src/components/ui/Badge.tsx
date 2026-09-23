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

export type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'student'
  | 'organizer'
  | 'active'
  | 'upcoming'
  | 'closed'
  | 'more'
  | 'backend'
  | 'frontend'
  | 'ai'
  | 'devops'
  | 'design'
  | 'success'
  | 'warning'
  | 'error'
  | 'muted';

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

/**
 * Quiet Focus Tag Resolver:
 * Uniform flat neutral chips across all tech tags to eliminate visual noise.
 */
export function getSkillBadgeVariant(_skillName?: string): BadgeVariant {
  return 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  onPress,
  onRemove,
  style,
  textStyle,
}) => {
  // Handle minimal status dot indicators (ACTIVE / UPCOMING / CLOSED)
  if (variant === 'active' || variant === 'upcoming' || variant === 'closed') {
    const dotColor = variant === 'active' ? colors.student : colors.textMuted;

    return (
      <View style={[styles.statusWrapper, style]}>
        <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
        <Text style={[styles.statusText, textStyle]}>{label}</Text>
      </View>
    );
  }

  const content = (
    <View
      style={[
        styles.chipBase,
        variant === 'more' ? styles.chipMore : styles.chipNeutral,
        styles[`size_${size}`],
        style,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          variant === 'more' ? styles.chipMoreText : null,
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
          <Text style={styles.removeText}>×</Text>
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
  // ── Flat Neutral Chips (No border, calm grayscale) ─────────────
  chipBase: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    borderWidth: 0,
  },
  chipNeutral: {
    backgroundColor: colors.chipBackground, // #1F2226
  },
  chipMore: {
    backgroundColor: 'transparent',
  },
  size_sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  size_md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    ...typography.caption,
    color: colors.chipText, // #C7CBD1
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  chipMoreText: {
    color: colors.chipMoreText, // #868D99
  },
  textSize_sm: {
    fontSize: 11,
    lineHeight: 15,
  },
  textSize_md: {
    fontSize: 12,
    lineHeight: 16,
  },
  removeBtn: {
    marginLeft: spacing.xs,
  },
  removeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    lineHeight: 14,
  },

  // ── Status Dot Indicators (6px dot + gray text) ─────────────────
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

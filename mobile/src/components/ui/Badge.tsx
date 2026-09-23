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
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'muted'
  | 'cyan'
  | 'pink';

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
 * Intelligent categorization helper that assigns unique vibrant
 * prismatic palette tones based on the specific skill domain/field.
 */
export function getSkillBadgeVariant(skillName: string): BadgeVariant {
  const s = skillName.toLowerCase();
  // AI, ML & Data Science -> Emerald Matrix Green (#10B981)
  if (
    s.includes('python') ||
    s.includes('pytorch') ||
    s.includes('tensor') ||
    s.includes('gemini') ||
    s.includes('ai') ||
    s.includes('vision') ||
    s.includes('nlp') ||
    s.includes('langchain') ||
    s.includes('data') ||
    s.includes('model') ||
    s.includes('ml') ||
    s.includes('llm') ||
    s.includes('deep learning') ||
    s.includes('machine learning') ||
    s.includes('openai') ||
    s.includes('scikit') ||
    s.includes('pandas') ||
    s.includes('numpy')
  ) {
    return 'success';
  }
  // Mobile Development -> Electric Amethyst Purple (#A855F7)
  if (
    s.includes('react native') ||
    s.includes('flutter') ||
    s.includes('kotlin') ||
    s.includes('swift') ||
    s.includes('android') ||
    s.includes('ios') ||
    s.includes('expo') ||
    s.includes('mobile')
  ) {
    return 'primary';
  }
  // Frontend Development -> Sunset Rose Neon Coral (#F43F5E)
  if (
    s.includes('react') ||
    s.includes('next') ||
    s.includes('typescript') ||
    s.includes('javascript') ||
    s.includes('tailwind') ||
    s.includes('vue') ||
    s.includes('angular') ||
    s.includes('svelte') ||
    s.includes('html') ||
    s.includes('css') ||
    s.includes('frontend') ||
    s.includes('web')
  ) {
    return 'secondary';
  }
  // Backend & Core Systems -> Solar Amber Flare Gold (#F59E0B)
  if (
    s.includes('node') ||
    s.includes('nest') ||
    s.includes('fastapi') ||
    s.includes('go') ||
    s.includes('java') ||
    s.includes('spring') ||
    s.includes('rust') ||
    s.includes('graphql') ||
    s.includes('backend') ||
    s.includes('c++') ||
    s.includes('c#') ||
    s.includes('.net') ||
    s.includes('django') ||
    s.includes('flask') ||
    s.includes('rest') ||
    s.includes('api')
  ) {
    return 'warning';
  }
  // Database, Cloud, DevOps & Web3 -> Cyber Neon Cyan (#06B6D4)
  if (
    s.includes('sql') ||
    s.includes('postgres') ||
    s.includes('mongo') ||
    s.includes('redis') ||
    s.includes('prisma') ||
    s.includes('docker') ||
    s.includes('k8s') ||
    s.includes('kubernetes') ||
    s.includes('aws') ||
    s.includes('gcp') ||
    s.includes('azure') ||
    s.includes('cloud') ||
    s.includes('devops') ||
    s.includes('ci/cd') ||
    s.includes('supabase') ||
    s.includes('firebase') ||
    s.includes('solidity') ||
    s.includes('web3') ||
    s.includes('blockchain') ||
    s.includes('crypto') ||
    s.includes('zkp') ||
    s.includes('security')
  ) {
    return 'cyan';
  }
  // Design & Product -> Prismatic Fuchsia Pink (#EC4899)
  if (
    s.includes('figma') ||
    s.includes('design') ||
    s.includes('ui') ||
    s.includes('ux') ||
    s.includes('product') ||
    s.includes('prototyping') ||
    s.includes('wirefram')
  ) {
    return 'pink';
  }
  // Default fallback
  return 'primary';
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
  cyan: {
    backgroundColor: colors.accentCyanSubtle,
    borderColor: colors.accentCyan,
    borderWidth: 1,
  },
  pink: {
    backgroundColor: colors.accentPinkSubtle,
    borderColor: colors.accentPink,
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
  text_cyan: {
    color: colors.accentCyan,
  },
  text_pink: {
    color: colors.accentPink,
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

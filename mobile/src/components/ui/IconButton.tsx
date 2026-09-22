import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors } from '../../theme';

export interface IconButtonProps {
  icon: string | React.ReactNode;
  onPress: () => void;
  size?: number;
  badgeCount?: number;
  variant?: 'default' | 'primary' | 'ghost';
  style?: ViewStyle;
  iconStyle?: TextStyle;
  accessibilityLabel?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 42,
  badgeCount = 0,
  variant = 'default',
  style,
  iconStyle,
  accessibilityLabel,
}) => {
  const isTextIcon = typeof icon === 'string';

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.base,
        styles[variant],
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      {isTextIcon ? (
        <Text style={[styles.textIcon, iconStyle]}>{icon}</Text>
      ) : (
        icon
      )}

      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  default: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.surfaceBorder,
  },
  primary: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  textIcon: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

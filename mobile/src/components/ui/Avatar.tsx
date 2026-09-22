import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import { colors, typography } from '../../theme';

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = 'User',
  size = 48,
  showOnlineStatus = false,
  isOnline = false,
  style,
}) => {
  const getInitials = (text: string) => {
    const parts = text.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return text.slice(0, 2).toUpperCase();
  };

  const statusSize = Math.max(8, Math.round(size * 0.25));

  return (
    <View style={[{ width: size, height: size }, style]}>
      {uri ? (
        <Image
          source={{ uri } as ImageSourcePropType}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text
            style={[
              styles.initials,
              { fontSize: Math.round(size * 0.38) },
            ]}
          >
            {getInitials(name)}
          </Text>
        </View>
      )}

      {showOnlineStatus && (
        <View
          style={[
            styles.statusDot,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
              backgroundColor: isOnline ? colors.success : colors.textMuted,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surfaceElevated,
  },
  placeholder: {
    backgroundColor: colors.primarySubtle,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    ...typography.h3,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  statusDot: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.background,
    right: 0,
    bottom: 0,
  },
});

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { offlineCacheService } from '../../services/offlineCache';

declare const process: any;

interface OfflineBannerProps {
  onRetry?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onRetry }) => {
  const [isOnline, setIsOnline] = useState(offlineCacheService.getIsOnline());
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = offlineCacheService.subscribeToNetworkChanges((online) => {
      if (!isMounted) return;
      setIsOnline(online);

      if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
        return;
      }

      Animated.timing(slideAnim, {
        toValue: online ? -50 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [slideAnim]);

  if (isOnline) {
    return null;
  }

  const handleRetry = () => {
    offlineCacheService.setIsOnline(true);
    onRetry?.();
  };

  return (
    <Animated.View
      style={[
        styles.banner,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.textRow}>
        <Text style={styles.icon}>⚡</Text>
        <Text style={styles.message}>
          Offline Mode • Showing cached squad & match data
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleRetry}
        style={styles.retryBtn}
      >
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  message: {
    ...typography.captionBold,
    color: colors.textInverse,
    fontSize: 11,
    flex: 1,
  },
  retryBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
  retryText: {
    ...typography.captionBold,
    color: colors.textInverse,
    fontSize: 11,
  },
});

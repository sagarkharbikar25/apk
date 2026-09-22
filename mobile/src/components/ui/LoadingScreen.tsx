import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';

export interface LoadingScreenProps {
  message?: string;
  subtitle?: string;
  isOverlay?: boolean;
  style?: ViewStyle;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  subtitle = 'Please wait a moment',
  isOverlay = false,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={[isOverlay ? styles.overlayContainer : styles.fullContainer, style]}>
      {/* Glowing emblem container */}
      <Animated.View
        style={[
          styles.emblemContainer,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <View style={styles.emblemInner}>
          <Text style={styles.emblemText}>⚡</Text>
        </View>
      </Animated.View>

      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />

      <Text style={styles.messageText}>{message}</Text>
      {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    zIndex: 999,
  },
  emblemContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySubtle,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emblemInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emblemText: {
    fontSize: 26,
  },
  spinner: {
    marginBottom: spacing.md,
  },
  messageText: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitleText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

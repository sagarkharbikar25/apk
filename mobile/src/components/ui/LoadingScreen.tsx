import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

export interface LoadingScreenProps {
  message?: string;
  subtitle?: string;
  tag?: string;
  isOverlay?: boolean;
  style?: ViewStyle;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  subtitle = 'Please wait a moment',
  tag = 'SYNCHRONIZING',
  isOverlay = false,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.35)).current;
  const sweepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Subtle breathing pulse for brand emblem
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.8,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.35,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // 2. High-tech smooth indeterminate progress sweep
    const sweep = Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      })
    );

    breathe.start();
    sweep.start();

    return () => {
      breathe.stop();
      sweep.stop();
    };
  }, [pulseAnim, glowOpacity, sweepAnim]);

  // Translate progress runner across a 160px track (-60 to +160)
  const runnerTranslateX = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 160],
  });

  return (
    <View style={[isOverlay ? styles.overlayContainer : styles.fullContainer, style]}>
      {/* Ambient Pulsing Aura */}
      <View style={styles.centerSection}>
        <Animated.View
          style={[
            styles.ambientAura,
            {
              opacity: glowOpacity,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />

        {/* Futuristic Brand Card */}
        <Animated.View
          style={[
            styles.brandCard,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Sleek Indeterminate Track */}
      <View style={styles.trackContainer}>
        <View style={styles.trackBackground}>
          <Animated.View
            style={[
              styles.trackRunner,
              { transform: [{ translateX: runnerTranslateX }] },
            ]}
          />
        </View>
      </View>

      {/* Typography Hierarchy */}
      <View style={styles.textContainer}>
        <Text style={styles.tagText}>{tag}</Text>
        <Text style={styles.messageText}>{message}</Text>
        {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
      </View>
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
  centerSection: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  ambientAura: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.secondaryGlow,
  },
  brandCard: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorderHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  logoImage: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  trackContainer: {
    marginBottom: spacing.lg,
  },
  trackBackground: {
    width: 160,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  trackRunner: {
    width: 60,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.secondary,
    shadowColor: colors.secondaryLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: 280,
  },
  tagText: {
    ...typography.captionBold,
    color: colors.secondaryLight,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  messageText: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: spacing.xs,
  },
  subtitleText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

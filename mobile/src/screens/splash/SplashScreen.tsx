import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

declare const process: any;

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      onFinish?.();
      return;
    }

    let isMounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!isMounted) return;
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        if (!isMounted) return;
        timer = setTimeout(() => {
          if (isMounted) {
            onFinish?.();
          }
        }, 1200);
      });
    });

    return () => {
      isMounted = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [fadeAnim, scaleAnim, textFadeAnim, onFinish]);

  return (
    <View style={styles.container}>
      {/* Background ambient glow circles */}
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Futuristic Brand Emblem */}
        <View style={styles.emblemOuter}>
          <View style={styles.emblemMiddle}>
            <View style={styles.emblemCore}>
              <Text style={styles.emblemIcon}>⚡</Text>
            </View>
          </View>
        </View>

        {/* Brand Title */}
        <Text style={styles.brandTitle}>SkillSync</Text>
        <Text style={styles.brandAccent}>AI HACKATHON COLLABORATION</Text>

        <Animated.View style={[styles.taglineWrap, { opacity: textFadeAnim }]}>
          <Text style={styles.tagline}>
            Match with dream teammates & projects using explainable AI.
          </Text>

          <View style={styles.statusPill}>
            <View style={styles.liveIndicator} />
            <Text style={styles.statusText}>Gemini AI • Redis Real-Time</Text>
          </View>

          <ActivityIndicator
            size="small"
            color={colors.primaryLight}
            style={styles.spinner}
          />
        </Animated.View>
      </Animated.View>

      <Text style={styles.footerVersion}>SkillSync v1.0 • Enterprise Edition</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  glowTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.primarySubtle,
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.secondarySubtle,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  emblemOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.primarySubtle,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emblemMiddle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  emblemCore: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emblemIcon: {
    fontSize: 30,
  },
  brandTitle: {
    ...typography.h1,
    fontSize: 36,
    lineHeight: 42,
    color: colors.textPrimary,
    letterSpacing: -1,
    fontWeight: '800',
  },
  brandAccent: {
    ...typography.captionBold,
    color: colors.secondaryLight,
    letterSpacing: 2,
    marginTop: spacing.xxs,
    marginBottom: spacing.lg,
  },
  taglineWrap: {
    alignItems: 'center',
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: spacing.xl,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  statusText: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 11,
  },
  spinner: {
    marginTop: spacing.xs,
  },
  footerVersion: {
    position: 'absolute',
    bottom: spacing.xxl,
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
});

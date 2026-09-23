import React from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../../theme';

interface AppLogoProps {
  size?: number;
  showText?: boolean;
  style?: ViewStyle;
}

/**
 * Campus Signal App Emblem
 * Combines Signal Teal & Trophy Gold geometric signal waves
 */
export const AppLogo: React.FC<AppLogoProps> = ({
  size = 64,
  showText = false,
  style,
}) => {
  const iconSize = size;
  const outerBorderRadius = size * 0.28;

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.container,
          {
            width: iconSize,
            height: iconSize,
            borderRadius: outerBorderRadius,
          },
        ]}
      >
        {/* Signal Rings */}
        <View
          style={[
            styles.outerRing,
            {
              width: iconSize * 0.74,
              height: iconSize * 0.74,
              borderRadius: (iconSize * 0.74) / 2,
            },
          ]}
        >
          <View
            style={[
              styles.midRing,
              {
                width: iconSize * 0.50,
                height: iconSize * 0.50,
                borderRadius: (iconSize * 0.50) / 2,
              },
            ]}
          >
            {/* Center Signal Node */}
            <View
              style={[
                styles.centerCore,
                {
                  width: iconSize * 0.26,
                  height: iconSize * 0.26,
                  borderRadius: (iconSize * 0.26) / 2,
                },
              ]}
            >
              <Text style={[styles.symbol, { fontSize: iconSize * 0.16 }]}>⚡</Text>
            </View>
          </View>
        </View>

        {/* Dual Accent Corner Nodes */}
        <View style={[styles.nodeTeal, { width: iconSize * 0.14, height: iconSize * 0.14 }]} />
        <View style={[styles.nodeGold, { width: iconSize * 0.14, height: iconSize * 0.14 }]} />
      </View>

      {showText && (
        <View style={styles.textWrap}>
          <Text style={styles.brandTitle}>
            Skill<Text style={styles.brandAccent}>Sync</Text>
          </Text>
          <Text style={styles.brandSubtitle}>CAMPUS SIGNAL</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#171A21',
    borderWidth: 1.5,
    borderColor: '#262A33',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  outerRing: {
    borderWidth: 1.5,
    borderColor: 'rgba(20, 225, 196, 0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  midRing: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 176, 32, 0.60)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCore: {
    backgroundColor: colors.student,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    color: '#0F1115',
    fontWeight: '900',
  },
  nodeTeal: {
    position: 'absolute',
    top: 6,
    left: 6,
    borderRadius: 99,
    backgroundColor: colors.student,
  },
  nodeGold: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    borderRadius: 99,
    backgroundColor: colors.organizer,
  },
  textWrap: {
    marginTop: 10,
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: colors.student,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 2,
    marginTop: 2,
  },
});

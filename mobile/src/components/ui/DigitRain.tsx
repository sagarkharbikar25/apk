import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing, AccessibilityInfo, Dimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { colors } from '../../theme';
import { typography } from '../../theme';

interface DigitRainProps {
  animated?: boolean;
}

const { width, height } = Dimensions.get('window');
const COLUMNS = 14;
const ROWS = 40;

// Simple PRNG to keep digits stable across renders without relying on random per-render
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

const generateColumns = () => {
  const cols = [];
  let seed = 1;
  for (let i = 0; i < COLUMNS; i++) {
    const chars = [];
    for (let j = 0; j < ROWS; j++) {
      const rand = seededRandom(seed++);
      const isHot = rand < 0.08;
      const digit = Math.floor(seededRandom(seed++) * 10).toString();
      chars.push({ digit, isHot });
    }
    cols.push({
      chars,
      duration: 14000 + seededRandom(seed++) * 10000,
    });
  }
  return cols;
};

// Generate once per app load
const columnsData = generateColumns();

const RainColumn = ({ chars, duration, isAnimated, isFocused }: { chars: { digit: string, isHot: boolean }[], duration: number, isAnimated: boolean, isFocused: boolean }) => {
  const translateY = useRef(new Animated.Value(-height)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!isAnimated) return;

    if (isFocused) {
      animRef.current = Animated.loop(
        Animated.timing(translateY, {
          toValue: 0,
          duration: duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animRef.current.start();
    } else {
      animRef.current?.stop();
    }
    
    return () => animRef.current?.stop();
  }, [isAnimated, isFocused, duration, translateY]);

  return (
    <Animated.View style={[styles.column, isAnimated && { transform: [{ translateY }] }]}>
      {chars.map((char, index) => (
        <Text
          key={index}
          style={[
            styles.digit,
            { color: char.isHot ? colors.rainHot : colors.rain }
          ]}
        >
          {char.digit}
        </Text>
      ))}
      {isAnimated && chars.map((char, index) => (
        <Text
          key={`repeat-${index}`}
          style={[
            styles.digit,
            { color: char.isHot ? colors.rainHot : colors.rain }
          ]}
        >
          {char.digit}
        </Text>
      ))}
    </Animated.View>
  );
};

export const DigitRain = ({ animated = false }: DigitRainProps) => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  const shouldAnimate = animated && !reduceMotion;

  return (
    <View 
      style={[styles.container, !shouldAnimate && styles.staticContainer]} 
      pointerEvents="none"
      renderToHardwareTextureAndroid
    >
      {columnsData.map((col, index) => (
        <RainColumn
          key={index}
          chars={col.chars}
          duration={col.duration}
          isAnimated={shouldAnimate}
          isFocused={isFocused}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  staticContainer: {
    opacity: 0.6,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  digit: {
    ...typography.micro,
    textAlign: 'center',
    marginVertical: 2,
  },
});

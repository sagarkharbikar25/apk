import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, typography } from '../../theme';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide?: () => void;
  duration?: number;
}

export const Toast = ({ message, visible, onHide, duration = 3000 }: ToastProps) => {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 24,
        useNativeDriver: true,
      }).start();

      if (duration > 0 && onHide) {
        const timer = setTimeout(() => {
          Animated.timing(translateY, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onHide());
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, duration, translateY, onHide]);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View style={styles.accentBar} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.line,
    borderLeftWidth: 0,
    zIndex: 9999,
  },
  accentBar: {
    width: 4,
    backgroundColor: colors.accent,
  },
  message: {
    ...typography.label,
    color: colors.text,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flex: 1,
  },
});

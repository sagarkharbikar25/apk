import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, ViewProps } from 'react-native';
import { colors } from '../../theme';

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
}

export const Skeleton = ({ width, height, style, ...props }: SkeletonProps) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  return (
    <Animated.View 
      style={[
        styles.skeleton, 
        { width, height, opacity },
        style
      ]} 
      {...props} 
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surface2,
  },
});

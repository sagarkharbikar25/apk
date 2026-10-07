import React from 'react';
import { View, StyleSheet, ViewProps, Pressable } from 'react-native';
import { colors } from '../../theme';
import { CornerFrame } from './CornerFrame';

interface CardProps extends ViewProps {
  bracket?: boolean;
  onPress?: () => void;
}

export const Card = ({ children, bracket, onPress, style, ...props }: CardProps) => {
  const content = (
    <>
      {children}
      {bracket && <CornerFrame />}
    </>
  );

  if (onPress) {
    return (
      <Pressable 
        style={({ pressed }) => [styles.card, pressed && styles.pressed, style as any]} 
        onPress={onPress}
        {...(props as any)}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, style]} {...props}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    position: 'relative',
  },
  pressed: {
    backgroundColor: colors.surface2,
  },
});

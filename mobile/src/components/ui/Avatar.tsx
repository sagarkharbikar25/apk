import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

interface AvatarProps {
  name: string;
  size?: number;
}

export const Avatar = ({ name, size = 48 }: AvatarProps) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={styles.initial}>{initial}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  initial: {
    fontFamily: typography.displayM.fontFamily, // Orbitron-Black
    fontSize: 24,
    color: colors.text,
  },
});

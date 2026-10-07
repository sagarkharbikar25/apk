import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors } from '../../theme';

interface IconBoxProps extends ViewProps {
  icon: LucideIcon;
}

export const IconBox = ({ icon: Icon, style, ...props }: IconBoxProps) => {
  return (
    <View style={[styles.container, style]} {...props}>
      <Icon size={20} strokeWidth={1.5} color={colors.accent} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

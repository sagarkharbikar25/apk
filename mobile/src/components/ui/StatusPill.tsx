import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

type Status = 'OPEN' | 'CLOSED' | 'FULL';

interface StatusPillProps {
  status: Status;
}

export const StatusPill = ({ status }: StatusPillProps) => {
  let color = colors.textDim;
  if (status === 'OPEN') color = colors.accent;
  if (status === 'FULL') color = colors.warn;

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.micro,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import { colors, typography } from '../../theme';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export const ErrorState = ({ message = 'SOMETHING WENT WRONG', onRetry }: ErrorStateProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{'// REQUEST FAILED'}</Text>
      <Text style={styles.message}>{message}</Text>
      <Button 
        variant="outline" 
        label="RETRY" 
        onPress={onRetry} 
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  label: {
    ...typography.micro,
    color: colors.accent,
    marginBottom: 16,
  },
  message: {
    ...typography.body,
    color: colors.text,
    marginBottom: 24,
  },
  button: {
    alignSelf: 'flex-start',
  },
});

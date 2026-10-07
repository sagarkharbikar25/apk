import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Button } from './Button';
import { colors, typography } from '../../theme';

interface EmptyStateProps {
  icon: LucideIcon;
  label: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ icon: Icon, label, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <Icon size={48} color={colors.textDim} strokeWidth={1} style={styles.icon} />
      <Text style={styles.label}>{'// '}{label}</Text>
      {actionLabel && onAction && (
        <Button 
          variant="outline" 
          label={actionLabel} 
          onPress={onAction} 
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 24,
  },
  label: {
    ...typography.micro,
    color: colors.textDim,
    marginBottom: 24,
  },
  button: {
    minWidth: 160,
  },
});

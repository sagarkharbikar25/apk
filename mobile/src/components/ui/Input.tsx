import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { colors, typography } from '../../theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const Input = ({ label, error, style, onFocus, onBlur, ...props }: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[typography.label, styles.label, isFocused && styles.labelFocused, !!error && styles.labelError]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
          style
        ]}
        onFocus={(e) => {
          setIsFocused(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (onBlur) onBlur(e);
        }}
        placeholderTextColor={colors.textDim}
        selectionColor={colors.accent}
        {...props}
      />
      {error && (
        <View style={styles.errorContainer}>
          <AlertTriangle size={14} color={colors.accent} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: colors.textMuted,
    marginBottom: 8,
  },
  labelFocused: {
    color: colors.accent,
  },
  labelError: {
    color: colors.accent,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 16,
    ...typography.body,
  },
  inputFocused: {
    borderColor: colors.accent,
  },
  inputError: {
    borderColor: colors.accent,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    ...typography.micro,
    color: colors.accent,
    marginLeft: 6,
    textTransform: 'none',
  }
});

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Screen, Brand, IconBox, Button } from '../../components/ui';
import { colors, typography } from '../../theme';
import { Fingerprint } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';

export const BiometricUnlockScreen = () => {
  // Using logout as a fallback to return to login
  const logout = useAuthStore(s => s.logout);

  const handleUsePassword = () => {
    logout(); 
  };

  return (
    <Screen withRain="static" style={styles.container}>
      <View style={styles.content}>
        <Brand size="large" style={styles.brand} />
        
        <View style={styles.fingerprintBox}>
          <IconBox icon={Fingerprint} style={styles.iconBox} />
          <View style={styles.scanLine} />
        </View>

        <Text style={styles.instruction}>{'// AWAITING BIOMETRIC SCAN'}</Text>
      </View>

      <View style={styles.footer}>
        <Button 
          label="MANUAL UNLOCK" 
          variant="outline"
          onPress={handleUsePassword} 
          style={styles.button}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    marginBottom: 80,
  },
  fingerprintBox: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
    position: 'relative',
    overflow: 'hidden',
  },
  iconBox: {
    width: 64,
    height: 64,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  scanLine: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  instruction: {
    ...typography.micro,
    color: colors.textMuted,
  },
  footer: {
    paddingBottom: 24,
  },
  button: {
    width: '100%',
  }
});

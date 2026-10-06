import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TeamsStackParamList } from '../../navigation/types';
import { useTeamsStore } from '../../store/teamsStore';
import { Button, Input, Card, Header, Badge } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<TeamsStackParamList, 'QRScanner'>;

export const QRScannerScreen: React.FC<Props> = ({ navigation }) => {
  const { joinTeamWithQr, isLoading, error } = useTeamsStore();
  const [manualToken, setManualToken] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 220,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    scanLoop.start();
    return () => scanLoop.stop();
  }, [laserAnim]);

  const handleProcessToken = async (rawCode: string) => {
    // Extract token from skillsync://join/team/{token} or use raw string
    let token = rawCode.trim();
    if (token.includes('/join/team/')) {
      const parts = token.split('/join/team/');
      token = parts[parts.length - 1];
    }

    if (!token) return;

    // Use default team ID or extracted target
    const result = await joinTeamWithQr('tm-1', token);
    if (result.success) {
      setSuccessMessage('Successfully joined the team! Redirecting...');
      setTimeout(() => {
        navigation.navigate('TeamsList');
      }, 1500);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="Scan Team QR"
        subtitle="Align the QR code within the viewfinder"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Scanner Viewfinder Box */}
        <View style={styles.viewfinder}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />

          {/* Animated Scanning Laser Line */}
          <Animated.View
            style={[
              styles.laserLine,
              { transform: [{ translateY: laserAnim }] },
            ]}
          />

          <View style={styles.viewfinderCenter}>
            <Text style={styles.viewfinderIcon}>📷</Text>
            <Text style={styles.viewfinderHint}>Camera Scanner Ready</Text>
          </View>
        </View>

        {successMessage ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ {successMessage}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Quick Simulation / Manual Code Entry */}
        <Card variant="elevated" style={styles.manualCard}>
          <Text style={styles.manualTitle}>Manual Code / Simulation</Text>
          <Text style={styles.manualSubtitle}>
            Paste a token or test simulated scan with one tap:
          </Text>

          <Input
            placeholder="e.g. qr-token-abc-123"
            value={manualToken}
            onChangeText={setManualToken}
            containerStyle={styles.inputContainer}
          />

          <View style={styles.quickButtons}>
            <TouchableOpacity
              style={styles.simulatePill}
              onPress={() => handleProcessToken('qr-token-abc-123')}
            >
              <Badge label="⚡ Simulate Valid QR Scan" variant="primary" size="sm" />
            </TouchableOpacity>
          </View>

          <Button
            title="Join Team"
            onPress={() => handleProcessToken(manualToken)}
            isLoading={isLoading}
            disabled={!manualToken.trim()}
            style={styles.joinBtn}
          />
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  viewfinder: {
    width: 250,
    height: 250,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.secondary,
    borderTopLeftRadius: borderRadius.md,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.secondary,
    borderTopRightRadius: borderRadius.md,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.secondary,
    borderBottomLeftRadius: borderRadius.md,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.secondary,
    borderBottomRightRadius: borderRadius.md,
  },
  laserLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
    top: 15,
  },
  viewfinderCenter: {
    alignItems: 'center',
  },
  viewfinderIcon: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  viewfinderHint: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  successBanner: {
    backgroundColor: colors.successSubtle,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    width: '100%',
  },
  successText: {
    ...typography.captionBold,
    color: colors.success,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: colors.errorSubtle,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    width: '100%',
  },
  errorText: {
    ...typography.captionBold,
    color: colors.error,
    textAlign: 'center',
  },
  manualCard: {
    width: '100%',
    padding: spacing.lg,
  },
  manualTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  manualSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    marginBottom: spacing.xs,
  },
  quickButtons: {
    marginVertical: spacing.xs,
  },
  simulatePill: {
    alignSelf: 'flex-start',
  },
  joinBtn: {
    marginTop: spacing.sm,
  },
});

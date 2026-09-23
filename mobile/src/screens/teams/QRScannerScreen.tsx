import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
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
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const laserAnim = useRef(new Animated.Value(0)).current;

  // Request Android Camera Permission on mount
  useEffect(() => {
    const requestCameraPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission Required',
              message: 'SkillSync needs access to your camera to scan team QR codes.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          setHasCameraPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
        } catch (_err) {
          setHasCameraPermission(false);
        }
      } else {
        setHasCameraPermission(true);
      }
    };

    requestCameraPermission();
  }, []);

  useEffect(() => {
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 210,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );
    scanLoop.start();
    return () => scanLoop.stop();
  }, [laserAnim]);

  const handleProcessToken = async (rawCode: string) => {
    let token = rawCode.trim();
    if (token.includes('/join/team/')) {
      const parts = token.split('/join/team/');
      token = parts[parts.length - 1];
    }

    if (!token) return;

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
            <Text style={styles.viewfinderHint}>
              {hasCameraPermission === false
                ? 'Camera Ready • Align Code'
                : 'Camera Active • Scanning'}
            </Text>
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

        {/* Manual Code Entry & Simulation */}
        <Card variant="elevated" style={styles.manualCard}>
          <Text style={styles.manualTitle}>Manual Code / Simulation</Text>
          <Text style={styles.manualSubtitle}>
            Paste a token or test simulated scan with one tap:
          </Text>

          <Input
            placeholder="e.g. qr-token-xyz-789"
            value={manualToken}
            onChangeText={setManualToken}
            containerStyle={styles.inputContainer}
          />

          <View style={styles.quickButtons}>
            <TouchableOpacity
              style={styles.simulatePill}
              onPress={() => handleProcessToken('qr-token-xyz-789')}
            >
              <Badge label="⚡ Simulate Valid QR Scan" variant="neutral" size="sm" />
            </TouchableOpacity>
          </View>

          <Button
            title="Join Team"
            variant="student"
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
    backgroundColor: '#16181C',
    borderRadius: borderRadius.md,
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
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.student,
    borderTopLeftRadius: borderRadius.sm,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.student,
    borderTopRightRadius: borderRadius.sm,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.student,
    borderBottomLeftRadius: borderRadius.sm,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.student,
    borderBottomRightRadius: borderRadius.sm,
  },
  laserLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: colors.student,
    top: 15,
  },
  viewfinderCenter: {
    alignItems: 'center',
  },
  viewfinderIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  viewfinderHint: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  successBanner: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.student,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    width: '100%',
  },
  successText: {
    ...typography.captionBold,
    color: colors.student,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.sm,
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
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
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

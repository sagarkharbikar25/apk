import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Card } from '../../components/ui';
import { colors, typography, spacing } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

export const VerifyEmailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { email } = route.params;
  const { verifyEmail, resendOtp, isLoading, error, clearError } = useAuthStore();

  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (otpCode.length !== 6) return;
    clearError();
    await verifyEmail(email, otpCode);
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    clearError();
    const success = await resendOtp(email);
    if (success) {
      setCountdown(60);
      setResendStatus('A new 6-digit verification code has been dispatched.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>Verify Your Email</Text>
          <Text style={styles.cardSubtitle}>
            We've sent a 6-digit confirmation code to:
          </Text>
          <Text style={styles.emailHighlight}>{email}</Text>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {resendStatus && (
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerText}>{resendStatus}</Text>
            </View>
          )}

          <Input
            label="Verification Code"
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            value={otpCode}
            onChangeText={(val) => setOtpCode(val.replace(/[^0-9]/g, ''))}
            containerStyle={styles.inputContainer}
            inputStyle={styles.otpInput}
          />

          <Button
            title="Verify & Continue"
            onPress={handleVerify}
            isLoading={isLoading}
            disabled={otpCode.length !== 6}
            style={styles.submitBtn}
          />

          <View style={styles.resendRow}>
            {countdown > 0 ? (
              <Text style={styles.resendTimerText}>
                Resend code in {countdown}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendActionText}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backText}>Back to Sign In</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    padding: spacing.xl,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  emailHighlight: {
    ...typography.bodyBold,
    color: colors.primaryLight,
    marginBottom: spacing.lg,
  },
  errorBanner: {
    backgroundColor: colors.errorSubtle,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    ...typography.captionBold,
    color: colors.error,
    textAlign: 'center',
  },
  infoBanner: {
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  infoBannerText: {
    ...typography.captionBold,
    color: colors.primaryLight,
    textAlign: 'center',
  },
  inputContainer: {
    marginVertical: spacing.md,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  resendTimerText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  resendActionText: {
    ...typography.captionBold,
    color: colors.primaryLight,
  },
  backBtn: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  backText: {
    ...typography.body,
    color: colors.textMuted,
  },
});

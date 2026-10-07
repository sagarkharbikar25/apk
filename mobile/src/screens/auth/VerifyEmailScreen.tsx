import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Screen, Eyebrow, Headline, Button, GhostWord } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { colors, typography } from '../../theme';
import { ShieldCheck } from 'lucide-react-native';

export const VerifyEmailScreen = () => {
  const route = useRoute<any>();
  const email = route.params?.email || '';
  
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const resendOtp = useAuthStore((s) => s.resendOtp);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef<TextInput[]>([]);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length === 6) {
      await verifyEmail(email, code);
      // Navigation is handled by RootNavigator reacting to auth state
    }
  };

  const handleResend = () => {
    if (countdown === 0) {
      resendOtp(email);
      setCountdown(30);
    }
  };

  return (
    <Screen withRain="static">
      <GhostWord word="SECURE" />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Eyebrow label="2FA VERIFICATION" style={styles.mb} />
            <Headline accent="SIGNAL.">VERIFY</Headline>
            <Text style={styles.subtitle}>CODE SENT TO {email.toUpperCase()}</Text>
          </View>

          <View style={styles.form}>
            {!!error && (
              <Text style={styles.errorText}>{'// '}{error}</Text>
            )}

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    if (ref) inputs.current[index] = ref;
                  }}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                />
              ))}
            </View>

            <Button 
              label={isLoading ? "VERIFYING..." : "CONFIRM SIGNAL"} 
              icon={ShieldCheck}
              onPress={handleVerify}
              disabled={isLoading || otp.join('').length !== 6}
              style={styles.submit}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.mutedText}>DIDN'T RECEIVE IT?</Text>
            <Button 
              variant="ghost" 
              label={countdown > 0 ? `RESEND IN ${countdown}S` : "RESEND SIGNAL"} 
              onPress={handleResend}
              disabled={countdown > 0}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 80,
  },
  mb: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 48,
  },
  subtitle: {
    ...typography.micro,
    color: colors.textMuted,
    marginTop: 16,
  },
  form: {
    marginBottom: 48,
  },
  errorText: {
    ...typography.micro,
    color: colors.accent,
    marginBottom: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    textAlign: 'center',
    ...typography.displayM,
    color: colors.text,
  },
  otpInputFilled: {
    borderColor: colors.accent,
    color: colors.accent,
  },
  submit: {
    marginTop: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 24,
  },
  mutedText: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: 8,
  }
});

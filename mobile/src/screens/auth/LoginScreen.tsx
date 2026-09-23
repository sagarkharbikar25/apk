import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { loginSchema, LoginFormData } from './validation';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Card, Icon, AppLogo } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { biometricsService } from '../../services/biometrics';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, isLoading, error, clearError } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    await login(data.email, data.password);
  };

  const handleBiometricLogin = async () => {
    const success = await biometricsService.authenticate();
    if (success) {
      useAuthStore.getState().setSession(
        {
          id: 'usr-demo-1',
          email: 'alex.chen@mit.edu',
          name: 'Alex Chen',
          role: 'student',
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
        {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        }
      );
    }
  };

  const handleQuickDemoLogin = (role: 'student' | 'organizer') => {
    const isOrg = role === 'organizer';
    useAuthStore.getState().setSession(
      {
        id: isOrg ? 'usr-demo-org' : 'usr-demo-std',
        email: isOrg ? 'organizer@hackmit.org' : 'alex.chen@mit.edu',
        name: isOrg ? 'Sarah Lin' : 'Alex Chen',
        role: role,
        isVerified: true,
        createdAt: new Date().toISOString(),
      },
      {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      }
    );
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
        <View style={styles.header}>
          <AppLogo size={64} style={{ marginBottom: spacing.md }} />
          <Text style={styles.brandTitle}>SkillSync</Text>
          <Text style={styles.subtitle}>Find Your Ideal Hackathon Teammates</Text>
        </View>

        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>Sign in to your account</Text>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="College / Academic Email"
                placeholder="student@university.edu"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="••••••••"
                isPassword={true}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          <Button
            title="Sign In"
            onPress={() => handleSubmit(onSubmit)()}
            isLoading={isLoading}
            style={styles.submitBtn}
          />

          <Button
            title="Unlock with Biometrics"
            variant="outline"
            onPress={handleBiometricLogin}
            style={styles.bioBtn}
          />

          {/* Quick Demo Switcher */}
          <View style={styles.demoDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>QUICK DEMO ROLES</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.demoRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.demoBtn, styles.demoBtnStudent]}
              onPress={() => handleQuickDemoLogin('student')}
            >
              <View style={styles.studentDot} />
              <Text style={styles.demoBtnText}>Student Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.demoBtn, styles.demoBtnOrganizer]}
              onPress={() => handleQuickDemoLogin('organizer')}
            >
              <View style={styles.organizerDot} />
              <Text style={styles.demoBtnText}>Organizer Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>Create Account</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  brandTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  card: {
    padding: spacing.xl,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
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
  submitBtn: {
    marginTop: spacing.sm,
  },
  bioBtn: {
    marginTop: spacing.sm,
  },
  demoDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceBorder,
  },
  dividerText: {
    ...typography.captionBold,
    color: colors.textMuted,
    marginHorizontal: spacing.sm,
    fontSize: 10,
    letterSpacing: 1,
  },
  demoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: spacing.xs,
  },
  demoBtnStudent: {
    borderColor: colors.surfaceBorder,
  },
  demoBtnOrganizer: {
    borderColor: colors.surfaceBorder,
  },
  studentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.studentAccent,
  },
  organizerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.organizerAccent,
  },
  demoBtnText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  linkText: {
    ...typography.bodyBold,
    color: colors.studentAccent,
  },
});

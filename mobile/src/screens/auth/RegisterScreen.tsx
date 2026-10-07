import React from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, Eyebrow, Headline, Input, Button, GhostWord } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { colors, typography } from '../../theme';
import { UserPlus } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'organizer']),
  organizerCode: z.string().optional(),
}).refine(data => {
  if (data.role === 'organizer' && !data.organizerCode) return false;
  return true;
}, {
  message: 'Organizer code is required for organizers',
  path: ['organizerCode'],
});

type FormData = z.infer<typeof schema>;

export const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const globalError = useAuthStore((s) => s.error);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' }
  });

  const role = watch('role');

  const onSubmit = async (data: FormData) => {
    const res = await register(data);
    if (res.success) {
      if (res.requiresVerification) {
        navigation.navigate('VerifyEmail', { email: data.email });
      }
    }
  };

  return (
    <Screen withRain="static">
      <GhostWord word="INIT" />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Eyebrow label="NEW CLEARANCE" style={styles.mb} />
            <Headline accent="PROFILE.">CREATE</Headline>
          </View>

          <View style={styles.form}>
            {!!globalError && (
              <Text style={styles.errorText}>{'// '}{globalError}</Text>
            )}

            <View style={styles.roleToggle}>
              <Pressable 
                style={[styles.roleBtn, role === 'student' && styles.roleBtnActive]} 
                onPress={() => setValue('role', 'student')}
              >
                <Text style={[styles.roleText, role === 'student' && styles.roleTextActive]}>STUDENT</Text>
              </Pressable>
              <Pressable 
                style={[styles.roleBtn, role === 'organizer' && styles.roleBtnActive]} 
                onPress={() => setValue('role', 'organizer')}
              >
                <Text style={[styles.roleText, role === 'organizer' && styles.roleTextActive]}>ORGANISER</Text>
              </Pressable>
            </View>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input 
                  label="OPERATOR DESIGNATION (NAME)" 
                  value={value} 
                  onChangeText={onChange} 
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input 
                  label="CONTACT COMM (EMAIL)" 
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value} 
                  onChangeText={onChange} 
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input 
                  label="SECURITY PHRASE" 
                  secureTextEntry
                  value={value} 
                  onChangeText={onChange} 
                  error={errors.password?.message}
                />
              )}
            />

            {role === 'organizer' && (
              <Controller
                control={control}
                name="organizerCode"
                render={({ field: { onChange, value } }) => (
                  <Input 
                    label="AUTHORISATION CODE" 
                    value={value} 
                    onChangeText={onChange} 
                    error={errors.organizerCode?.message}
                  />
                )}
              />
            )}

            <Button 
              label={isLoading ? "PROCESSING..." : "REQUEST CLEARANCE"} 
              icon={UserPlus}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              style={styles.submit}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.mutedText}>ALREADY REGISTERED?</Text>
            <Button 
              variant="ghost" 
              label="RETURN TO LOGIN" 
              onPress={() => navigation.goBack()}
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
    marginBottom: 32,
  },
  form: {
    marginBottom: 48,
  },
  errorText: {
    ...typography.micro,
    color: colors.accent,
    marginBottom: 16,
  },
  roleToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 24,
  },
  roleBtn: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  roleBtnActive: {
    backgroundColor: colors.accentDim,
  },
  roleText: {
    ...typography.label,
    color: colors.textDim,
  },
  roleTextActive: {
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

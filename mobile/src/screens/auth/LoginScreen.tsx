import React, { useState } from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, Eyebrow, Headline, Input, Button, GhostWord } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { colors, typography } from '../../theme';
import { LogIn } from 'lucide-react-native';

export const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    setLocalError('');
    if (!email || !password) {
      setLocalError('Email and password are required');
      return;
    }
    const success = await login(email, password);
    if (!success) {
      // Error handled by store
    }
  };

  return (
    <Screen withRain="static">
      <GhostWord word="SYNC" />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Eyebrow label="IDENTIFICATION" style={styles.mb} />
            <Headline accent="BACK.">WELCOME</Headline>
          </View>

          <View style={styles.form}>
            {!!(error || localError) && (
              <Text style={styles.errorText}>{'// '}{error || localError}</Text>
            )}

            <Input 
              label="EMAIL ADDRESS" 
              placeholder="operator@domain.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Input 
              label="ACCESS CODE" 
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Button 
              label={isLoading ? "AUTHENTICATING..." : "SYSTEM LOGIN"} 
              icon={LogIn}
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.submit}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.mutedText}>NO CLEARANCE?</Text>
            <Button 
              variant="ghost" 
              label="REQUEST ACCESS (REGISTER)" 
              onPress={() => navigation.navigate('Register')}
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
  form: {
    marginBottom: 48,
  },
  errorText: {
    ...typography.micro,
    color: colors.accent,
    marginBottom: 16,
  },
  submit: {
    marginTop: 24,
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

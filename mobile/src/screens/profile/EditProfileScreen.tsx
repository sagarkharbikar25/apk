import React, { useState } from 'react';
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
import { ProfileStackParamList } from '../../navigation/types';
import { useProfileStore } from '../../store/profileStore';
import { Button, Input, Card } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, updateProfile, isSaving, error } = useProfileStore();

  const [college, setCollege] = useState(profile?.college || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [githubUrl, setGithubUrl] = useState(profile?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedinUrl || '');
  const [hours, setHours] = useState(String(profile?.availableHoursWeek || 15));
  const [lookingFor, setLookingFor] = useState<'teammate' | 'project' | 'both'>(
    profile?.lookingFor || 'both'
  );

  const handleSave = async () => {
    const success = await updateProfile({
      college,
      bio,
      githubUrl,
      linkedinUrl,
      availableHoursWeek: parseInt(hours, 10) || 10,
      lookingFor,
    });
    if (success) {
      navigation.goBack();
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
          <Text style={styles.cardTitle}>Edit Profile</Text>
          <Text style={styles.cardSubtitle}>
            Update your information to enhance AI matchmaking results
          </Text>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <Input
            label="College / University"
            placeholder="e.g. Stanford University"
            value={college}
            onChangeText={setCollege}
          />

          <Input
            label="About & Bio"
            placeholder="Share your experience, passions, and hackathon goals..."
            multiline={true}
            numberOfLines={4}
            value={bio}
            onChangeText={setBio}
            inputStyle={styles.bioInput}
          />

          <Input
            label="Weekly Availability (Hours)"
            placeholder="15"
            keyboardType="number-pad"
            value={hours}
            onChangeText={setHours}
          />

          {/* Looking For Selector */}
          <Text style={styles.selectorLabel}>LOOKING FOR</Text>
          <View style={styles.pillContainer}>
            {(['teammate', 'project', 'both'] as const).map((option) => (
              <TouchableOpacity
                key={option}
                activeOpacity={0.8}
                style={[
                  styles.pill,
                  lookingFor === option && styles.pillActive,
                ]}
                onPress={() => setLookingFor(option)}
              >
                <Text
                  style={[
                    styles.pillText,
                    lookingFor === option && styles.pillTextActive,
                  ]}
                >
                  {option.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="GitHub Profile URL"
            placeholder="https://github.com/username"
            autoCapitalize="none"
            value={githubUrl}
            onChangeText={setGithubUrl}
          />

          <Input
            label="LinkedIn Profile URL"
            placeholder="https://linkedin.com/in/username"
            autoCapitalize="none"
            value={linkedinUrl}
            onChangeText={setLinkedinUrl}
          />

          <View style={styles.actionsRow}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={styles.cancelBtn}
            />
            <Button
              title="Save Changes"
              onPress={handleSave}
              isLoading={isSaving}
              style={styles.saveBtn}
            />
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
    padding: spacing.md,
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
  bioInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  selectorLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  pillContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  pill: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  pillActive: {
    borderColor: colors.studentAccent,
    backgroundColor: colors.surfaceElevated,
  },
  pillText: {
    ...typography.captionBold,
    color: colors.textMuted,
  },
  pillTextActive: {
    color: colors.studentAccent,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 2,
  },
});

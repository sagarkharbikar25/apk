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
import { TeamsStackParamList } from '../../navigation/types';
import { useTeamsStore } from '../../store/teamsStore';
import { Button, Input, Card, Header } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<TeamsStackParamList, 'CreateTeam'>;

const CAPACITY_OPTIONS = [2, 3, 4, 5, 6];

export const CreateTeamScreen: React.FC<Props> = ({ navigation }) => {
  const { createTeam, isSaving, error } = useTeamsStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hackathonId, setHackathonId] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const team = await createTeam({
      name: name.trim(),
      description: description.trim(),
      hackathonId: hackathonId.trim() || undefined,
      maxMembers,
    });

    if (team) {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="Create Hackathon Team"
        subtitle="Form your squad and start matching"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card variant="elevated" style={styles.card}>
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <Input
            label="Team Name"
            placeholder="e.g. VectorPulse Hackers"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Project Vision / Mission"
            placeholder="Describe your hackathon goals, project concept, or problem..."
            multiline={true}
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            inputStyle={styles.descInput}
          />

          <Input
            label="Target Hackathon (Optional)"
            placeholder="e.g. HackMIT 2026, CalHacks"
            value={hackathonId}
            onChangeText={setHackathonId}
          />

          {/* Member Capacity Selector */}
          <Text style={styles.capacityLabel}>MAX TEAM CAPACITY</Text>
          <View style={styles.capacityRow}>
            {CAPACITY_OPTIONS.map((cap) => (
              <TouchableOpacity
                key={cap}
                activeOpacity={0.8}
                style={[
                  styles.capacityPill,
                  maxMembers === cap && styles.capacityPillActive,
                ]}
                onPress={() => setMaxMembers(cap)}
              >
                <Text
                  style={[
                    styles.capacityText,
                    maxMembers === cap && styles.capacityTextActive,
                  ]}
                >
                  {cap}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.capacityHint}>
            Standard hackathon teams typically range between 3 to 4 hackers.
          </Text>

          <Button
            title="Create Squad & Generate QR"
            onPress={handleSubmit}
            isLoading={isSaving}
            disabled={!name.trim()}
            style={styles.submitBtn}
          />
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
  descInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  capacityLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  capacityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  capacityPill: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  capacityPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  capacityText: {
    ...typography.captionBold,
    color: colors.textMuted,
  },
  capacityTextActive: {
    color: colors.primaryLight,
  },
  capacityHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
});

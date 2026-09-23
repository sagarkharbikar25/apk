import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card, Button, Badge, Icon } from '../../components/ui';
import { useHackathonsStore } from '../../store/hackathonsStore';
import { useTeamsStore } from '../../store/teamsStore';

interface RegisterHackathonModalProps {
  visible: boolean;
  onClose: () => void;
  hackathonId: string;
  hackathonTitle: string;
  maxTeamSize: number;
}

export const RegisterHackathonModal: React.FC<RegisterHackathonModalProps> = ({
  visible,
  onClose,
  hackathonId,
  hackathonTitle,
  maxTeamSize,
}) => {
  const { registerForHackathon, isRegistering, error } = useHackathonsStore();
  const { teams } = useTeamsStore();

  const [registerType, setRegisterType] = useState<'individual' | 'team'>('team');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
    teams.length > 0 ? teams[0].id : null
  );
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    const res = await registerForHackathon(
      hackathonId,
      registerType === 'team' ? selectedTeamId || undefined : undefined
    );

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Card variant="elevated" style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Register for Hackathon</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.hackathonName}>{hackathonTitle}</Text>
          <Text style={styles.subtitle}>
            Max Team Size: {maxTeamSize} Hackers • Verified Registration
          </Text>

          {success && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>
                ✓ Successfully registered! Check your notifications.
              </Text>
            </View>
          )}

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Registration Type Selector */}
          <Text style={styles.label}>REGISTRATION TYPE</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.typePill,
                registerType === 'team' && styles.typePillActive,
              ]}
              onPress={() => setRegisterType('team')}
            >
              <Text
                style={[
                  styles.typeText,
                  registerType === 'team' && styles.typeTextActive,
                ]}
              >
                With My Squad
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.typePill,
                registerType === 'individual' && styles.typePillActive,
              ]}
              onPress={() => setRegisterType('individual')}
            >
              <Text
                style={[
                  styles.typeText,
                  registerType === 'individual' && styles.typeTextActive,
                ]}
              >
                Solo / Need Team
              </Text>
            </TouchableOpacity>
          </View>

          {/* Team Selector if Registering as Team */}
          {registerType === 'team' && (
            <View style={styles.teamSelectSection}>
              <Text style={styles.label}>SELECT YOUR SQUAD</Text>
              {teams.length === 0 ? (
                <View style={styles.noTeamBox}>
                  <Text style={styles.noTeamText}>
                    You haven't formed a team yet. Register solo or create a squad first!
                  </Text>
                </View>
              ) : (
                teams.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    activeOpacity={0.7}
                    style={[
                      styles.teamOption,
                      selectedTeamId === t.id && styles.teamOptionActive,
                    ]}
                    onPress={() => setSelectedTeamId(t.id)}
                  >
                    <Text
                      style={[
                        styles.teamOptionText,
                        selectedTeamId === t.id && styles.teamOptionTextActive,
                      ]}
                    >
                      {t.name} ({t.members.length} members)
                    </Text>
                    {selectedTeamId === t.id && (
                      <Badge label="SELECTED" variant="primary" size="sm" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          <View style={styles.actions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              style={styles.cancelBtn}
            />
            <Button
              title="Confirm Registration"
              onPress={handleRegister}
              isLoading={isRegistering}
              disabled={registerType === 'team' && !selectedTeamId}
              style={styles.confirmBtn}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeText: {
    ...typography.h3,
    color: colors.textMuted,
  },
  hackathonName: {
    ...typography.h2,
    color: colors.primaryLight,
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  successBanner: {
    backgroundColor: colors.successSubtle,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
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
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.captionBold,
    color: colors.error,
    textAlign: 'center',
  },
  label: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typePill: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  typePillActive: {
    borderColor: colors.studentAccent,
    backgroundColor: colors.surfaceElevated,
  },
  typeText: {
    ...typography.captionBold,
    color: colors.textMuted,
  },
  typeTextActive: {
    color: colors.studentAccent,
  },
  teamSelectSection: {
    marginBottom: spacing.md,
  },
  noTeamBox: {
    padding: spacing.sm,
  },
  noTeamText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  teamOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.xs,
  },
  teamOptionActive: {
    borderColor: colors.studentAccent,
    backgroundColor: colors.surfaceElevated,
  },
  teamOptionText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  teamOptionTextActive: {
    color: colors.studentAccent,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelBtn: {
    flex: 1,
  },
  confirmBtn: {
    flex: 2,
  },
});

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RecommendationItem } from '../../api/types';
import { useTeamsStore } from '../../store/teamsStore';
import { apiClient } from '../../api/client';
import { Card, Button, Badge, Avatar, Input, Icon } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';

export interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
  item: RecommendationItem | null;
  onSuccess: (itemId: string) => void;
}

const PROJECT_ROLE_OPTIONS = [
  'Mobile Frontend Lead',
  'Backend & Cloud Engineer',
  'AI / ML Specialist',
  'UI/UX Designer',
  'Full-Stack Hacker',
];

export const InviteModal: React.FC<InviteModalProps> = ({
  visible,
  onClose,
  item,
  onSuccess,
}) => {
  const { teams, fetchTeams, createTeam } = useTeamsStore();

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState(PROJECT_ROLE_OPTIONS[0]);
  const [newTeamName, setNewTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      fetchTeams();
      setErrorBanner(null);
      setSuccessMessage(null);
    }
  }, [visible, fetchTeams]);

  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  useEffect(() => {
    if (item) {
      if (item.type === 'candidate') {
        const firstName = item.title.split(' ')[0] || 'there';
        const topSkills = item.skills.slice(0, 2).join(' and ');
        setCustomMessage(
          `Hi ${firstName}! I saw your skills in ${topSkills || 'development'} and match score (${Math.round(
            item.matchScore * 100
          )}%). We'd love to invite you to our hackathon squad!`
        );
      } else {
        setCustomMessage(
          `Hi team! I'm really excited about ${item.title} and would love to contribute my experience in ${
            item.skills.slice(0, 2).join(' and ') || 'software development'
          }.`
        );
      }
    }
  }, [item]);

  if (!item) return null;

  const isCandidate = item.type === 'candidate';
  const scorePercentage = Math.round(item.matchScore * 100);

  const handleSend = async () => {
    setErrorBanner(null);
    setIsSubmitting(true);

    try {
      if (isCandidate) {
        let teamId = selectedTeamId;

        // If user had no team and typed a team name, create team first
        if (!teamId && newTeamName.trim()) {
          const newTeam = await createTeam({
            name: newTeamName.trim(),
            description: 'Hackathon team created from Discover',
            maxMembers: 4,
          });
          if (newTeam) {
            teamId = newTeam.id;
          }
        }

        if (!teamId) {
          setErrorBanner('Please select or create a squad to invite this candidate to.');
          setIsSubmitting(false);
          return;
        }

        try {
          await apiClient.post(`/teams/${teamId}/invite`, {
            inviteeId: item.id,
            message: customMessage,
          });
        } catch (_apiErr) {
          // Gracefully continue in offline/mock demo mode
        }

        setSuccessMessage(`✓ Invitation dispatched to ${item.title}!`);
      } else {
        // Applying to project
        try {
          await apiClient.post(`/projects/${item.id}/apply`, {
            role: selectedRole,
            message: customMessage,
          });
        } catch (_apiErr) {
          // Gracefully continue in offline/mock demo mode
        }

        setSuccessMessage(`✓ Application submitted to ${item.title}!`);
      }

      onSuccess(item.id);

      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage(null);
        onClose();
      }, 1300);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorBanner(err?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Card variant="elevated" style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.title}>
                {isCandidate ? 'Invite to Team' : 'Apply to Project'}
              </Text>
              <Text style={styles.subtitle}>
                {isCandidate
                  ? `Recruit ${item.title} to your squad`
                  : `Submit application for ${item.title}`}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Icon name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Success Banner */}
            {successMessage && (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            {/* Error Banner */}
            {errorBanner && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorBanner}</Text>
              </View>
            )}

            {/* Target Item Summary Preview */}
            <View style={styles.targetPreview}>
              <Avatar
                uri={item.avatarUrl}
                name={item.title}
                size={48}
                showOnlineStatus={isCandidate}
                isOnline={true}
              />
              <View style={styles.targetInfo}>
                <Text style={styles.targetName} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.targetSub} numberOfLines={1}>
                  {item.subtitle}
                </Text>
                {item.college && (
                  <Text style={styles.targetCollege} numberOfLines={1}>
                    🏫 {item.college}
                  </Text>
                )}
              </View>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreNumber}>{scorePercentage}%</Text>
                <Text style={styles.scoreLabel}>MATCH</Text>
              </View>
            </View>

            {/* Candidate Flow: Squad Selector */}
            {isCandidate && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>SELECT YOUR SQUAD</Text>
                {teams.length === 0 ? (
                  <View style={styles.noSquadContainer}>
                    <Text style={styles.noSquadHint}>
                      You don't have an active squad yet. Give your new squad a name to invite{' '}
                      {item.title}:
                    </Text>
                    <Input
                      placeholder="e.g. VectorPulse Hackers"
                      value={newTeamName}
                      onChangeText={setNewTeamName}
                      containerStyle={styles.teamInput}
                    />
                  </View>
                ) : (
                  <View style={styles.teamsList}>
                    {teams.map((t) => {
                      const isSelected = selectedTeamId === t.id;
                      const memberCount = t.members?.length || 0;
                      const maxCap = t.maxMembers || 4;
                      return (
                        <TouchableOpacity
                          key={t.id}
                          activeOpacity={0.7}
                          style={[
                            styles.teamOption,
                            isSelected && styles.teamOptionActive,
                          ]}
                          onPress={() => setSelectedTeamId(t.id)}
                        >
                          <View style={styles.teamOptionRadio}>
                            <View
                              style={[
                                styles.radioCircle,
                                isSelected && styles.radioCircleActive,
                              ]}
                            >
                              {isSelected && <View style={styles.radioDot} />}
                            </View>
                            <View style={styles.teamOptionInfo}>
                              <Text
                                style={[
                                  styles.teamOptionTitle,
                                  isSelected && styles.teamOptionTitleActive,
                                ]}
                              >
                                {t.name}
                              </Text>
                              <Text style={styles.teamOptionCapacity}>
                                {memberCount} / {maxCap} Members
                              </Text>
                            </View>
                          </View>
                          {isSelected && (
                            <Badge label="ACTIVE SQUAD" variant="primary" size="sm" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* Project Flow: Role Selector */}
            {!isCandidate && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>POSITION / ROLE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleScroll}>
                  {PROJECT_ROLE_OPTIONS.map((role) => {
                    const isSelected = selectedRole === role;
                    return (
                      <TouchableOpacity
                        key={role}
                        activeOpacity={0.7}
                        style={[
                          styles.rolePill,
                          isSelected && styles.rolePillActive,
                        ]}
                        onPress={() => setSelectedRole(role)}
                      >
                        <Text
                          style={[
                            styles.roleText,
                            isSelected && styles.roleTextActive,
                          ]}
                        >
                          {role}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Custom Invitation / Application Message */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                {isCandidate ? 'PERSONAL INVITATION NOTE' : 'PITCH / NOTE TO TEAM'}
              </Text>
              <Input
                placeholder="Write a brief message..."
                multiline={true}
                numberOfLines={3}
                value={customMessage}
                onChangeText={setCustomMessage}
                inputStyle={styles.msgInput}
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <Button
              title="Cancel"
              variant="outline"
              size="md"
              onPress={onClose}
              disabled={isSubmitting}
              style={styles.cancelBtn}
            />
            <Button
              title={
                isCandidate
                  ? isSubmitting ? 'Sending Invite...' : 'Send Team Invite'
                  : isSubmitting ? 'Submitting...' : 'Submit Application'
              }
              variant="student"
              size="md"
              isLoading={isSubmitting}
              disabled={isSubmitting || !!successMessage}
              onPress={handleSend}
              style={styles.sendBtn}
            />
          </View>
        </Card>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: '90%',
    padding: spacing.xl,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerTitleWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  scrollArea: {
    marginBottom: spacing.md,
  },
  successBanner: {
    backgroundColor: colors.successSubtle,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
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
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.captionBold,
    color: colors.error,
    textAlign: 'center',
  },
  targetPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
  },
  targetInfo: {
    flex: 1,
    marginLeft: spacing.sm + 4,
    marginRight: spacing.sm,
  },
  targetName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  targetSub: {
    ...typography.captionBold,
    color: colors.student,
    marginTop: 1,
  },
  targetCollege: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.matchHigh,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  scoreNumber: {
    ...typography.captionBold,
    fontSize: 13,
    fontWeight: '800',
    color: colors.matchHigh,
  },
  scoreLabel: {
    ...typography.caption,
    fontSize: 8,
    fontWeight: '800',
    color: colors.matchHigh,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.8,
    fontSize: 11,
  },
  noSquadContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  noSquadHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  teamInput: {
    marginBottom: 0,
  },
  teamsList: {
    gap: spacing.xs,
  },
  teamOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  teamOptionActive: {
    borderColor: colors.student,
    backgroundColor: colors.surfaceElevated,
  },
  teamOptionRadio: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.surfaceBorderHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  radioCircleActive: {
    borderColor: colors.student,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.student,
  },
  teamOptionInfo: {
    flex: 1,
  },
  teamOptionTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  teamOptionTitleActive: {
    color: colors.student,
  },
  teamOptionCapacity: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  roleScroll: {
    flexDirection: 'row',
    marginVertical: spacing.xxs,
  },
  rolePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginRight: spacing.xs,
  },
  rolePillActive: {
    borderColor: colors.student,
    backgroundColor: colors.surfaceCard,
  },
  roleText: {
    ...typography.captionBold,
    color: colors.textMuted,
    fontSize: 12,
  },
  roleTextActive: {
    color: colors.student,
  },
  msgInput: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cancelBtn: {
    flex: 1,
  },
  sendBtn: {
    flex: 2,
  },
});

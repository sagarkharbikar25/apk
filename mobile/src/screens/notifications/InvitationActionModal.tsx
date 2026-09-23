import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card, Button, Badge } from '../../components/ui';
import { useNotificationsStore, TeamInvitation } from '../../store/notificationsStore';

interface InvitationActionModalProps {
  visible: boolean;
  onClose: () => void;
  invitation: TeamInvitation;
}

export const InvitationActionModal: React.FC<InvitationActionModalProps> = ({
  visible,
  onClose,
  invitation,
}) => {
  const { respondToInvitation } = useNotificationsStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [decision, setDecision] = useState<'ACCEPTED' | 'DECLINED' | null>(null);

  const handleAction = async (status: 'ACCEPTED' | 'DECLINED') => {
    setIsProcessing(true);
    const success = await respondToInvitation(invitation.id, status);
    setIsProcessing(false);
    if (success) {
      setDecision(status);
      setTimeout(() => {
        setDecision(null);
        onClose();
      }, 1200);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Card variant="elevated" style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Squad Invitation</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emblemBox}>
            <Text style={styles.emblemIcon}>🤝</Text>
          </View>

          <Text style={styles.teamTitle}>{invitation.teamName}</Text>
          <Text style={styles.subtitle}>
            <Text style={styles.senderHighlight}>{invitation.senderName}</Text> has
            invited you to join their hackathon squad!
          </Text>

          {decision && (
            <View
              style={[
                styles.decisionBanner,
                decision === 'ACCEPTED' ? styles.bannerAccepted : styles.bannerDeclined,
              ]}
            >
              <Text
                style={[
                  styles.decisionText,
                  decision === 'ACCEPTED' ? styles.textAccepted : styles.textDeclined,
                ]}
              >
                {decision === 'ACCEPTED' ? '✓ You joined the squad!' : 'Invitation Declined'}
              </Text>
            </View>
          )}

          <Badge
            label="Verified Team Invitation • Direct Invite"
            variant="secondary"
            size="sm"
            style={styles.badge}
          />

          <View style={styles.actions}>
            <Button
              title="Decline"
              variant="outline"
              disabled={isProcessing || !!decision}
              onPress={() => handleAction('DECLINED')}
              style={styles.declineBtn}
            />
            <Button
              title="Accept & Join Squad"
              variant="primary"
              isLoading={isProcessing && !decision}
              disabled={isProcessing || !!decision}
              onPress={() => handleAction('ACCEPTED')}
              style={styles.acceptBtn}
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
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
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
  emblemBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  emblemIcon: {
    fontSize: 28,
  },
  teamTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  senderHighlight: {
    ...typography.bodyBold,
    color: colors.studentAccent,
  },
  decisionBanner: {
    width: '100%',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  bannerAccepted: {
    backgroundColor: colors.successSubtle,
    borderColor: colors.success,
  },
  bannerDeclined: {
    backgroundColor: colors.errorSubtle,
    borderColor: colors.error,
  },
  decisionText: {
    ...typography.captionBold,
    textAlign: 'center',
  },
  textAccepted: {
    color: colors.success,
  },
  textDeclined: {
    color: colors.error,
  },
  badge: {
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  declineBtn: {
    flex: 1,
  },
  acceptBtn: {
    flex: 2,
  },
});

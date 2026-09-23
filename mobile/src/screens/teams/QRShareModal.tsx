import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card, Button, Badge, QRCodeView } from '../../components/ui';

interface QRShareModalProps {
  visible: boolean;
  onClose: () => void;
  teamName: string;
  qrToken?: string | null;
}

export const QRShareModal: React.FC<QRShareModalProps> = ({
  visible,
  onClose,
  teamName,
  qrToken = 'team-qr-token-demo-99',
}) => {
  const [copied, setCopied] = useState(false);

  const joinDeepLink = `skillsync://join/team/${qrToken}`;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <Text style={styles.title}>Team Join QR Code</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.teamName}>{teamName}</Text>
          <Text style={styles.subtitle}>
            Have your teammate scan this code with their device camera to join instantly.
          </Text>

          {/* Real Scannable 2D QR Code */}
          <View style={styles.qrWrapper}>
            <QRCodeView
              value={joinDeepLink}
              size={180}
              backgroundColor="#FFFFFF"
              color="#0E0F12"
            />
          </View>

          <Badge
            label="⏱ Valid for 24 Hours • Redis Signed"
            variant="neutral"
            size="sm"
            style={styles.expiryBadge}
          />

          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={1}>
              {joinDeepLink}
            </Text>
          </View>

          <View style={styles.actions}>
            <Button
              title={copied ? '✓ Link Copied!' : 'Copy Invitation Link'}
              variant="student"
              onPress={handleCopy}
              style={styles.copyBtn}
            />
            <Button
              title="Close"
              variant="link"
              onPress={onClose}
              style={styles.closeActionBtn}
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
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
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
    fontSize: 16,
    color: colors.textMuted,
  },
  teamName: {
    ...typography.h2,
    color: colors.student,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.sm,
    maxWidth: 280,
  },
  qrWrapper: {
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expiryBadge: {
    marginVertical: spacing.xs,
  },
  linkBox: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    width: '100%',
    marginVertical: spacing.sm,
  },
  linkText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  copyBtn: {
    width: '100%',
  },
  closeActionBtn: {
    width: '100%',
  },
});

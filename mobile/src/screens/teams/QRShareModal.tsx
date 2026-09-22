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

          {/* High-Contrast QR Code Visual */}
          <View style={styles.qrContainer}>
            <View style={styles.qrCornerTL} />
            <View style={styles.qrCornerTR} />
            <View style={styles.qrCornerBL} />
            <View style={styles.qrCornerBR} />

            <View style={styles.qrGrid}>
              <View style={styles.qrEyeTL} />
              <View style={styles.qrEyeTR} />
              <View style={styles.qrEyeBL} />
              <View style={styles.qrCenterGraphic}>
                <Text style={styles.qrLogoIcon}>⚡</Text>
              </View>
            </View>
          </View>

          <Badge
            label="⏱ Valid for 24 Hours • Redis Signed Token"
            variant="primary"
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
              variant={copied ? 'secondary' : 'primary'}
              onPress={handleCopy}
              style={styles.copyBtn}
            />
            <Button
              title="Close"
              variant="outline"
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
    ...typography.h3,
    color: colors.textMuted,
  },
  teamName: {
    ...typography.h2,
    color: colors.primaryLight,
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
  qrContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
    position: 'relative',
  },
  qrCornerTL: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#000000',
  },
  qrCornerTR: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#000000',
  },
  qrCornerBL: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#000000',
  },
  qrCornerBR: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#000000',
  },
  qrGrid: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrEyeTL: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 32,
    height: 32,
    backgroundColor: '#000000',
    borderRadius: 6,
  },
  qrEyeTR: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    backgroundColor: '#000000',
    borderRadius: 6,
  },
  qrEyeBL: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 32,
    height: 32,
    backgroundColor: '#000000',
    borderRadius: 6,
  },
  qrCenterGraphic: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLogoIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  expiryBadge: {
    marginVertical: spacing.xs,
  },
  linkBox: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
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
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  copyBtn: {
    width: '100%',
  },
  closeActionBtn: {
    width: '100%',
  },
});

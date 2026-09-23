import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Header, Card, Badge, Button, Input, Icon } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface DispatchedBroadcast {
  id: string;
  title: string;
  message: string;
  target: string;
  timeAgo: string;
  recipientCount: number;
}

const TEMPLATES = [
  {
    title: '🚀 Hacking Officially Begun!',
    message: 'All API keys and cloud credits are live. Submission portals close tomorrow at 12:00 PM sharp.',
  },
  {
    title: '🍕 Midnight Snacks Ready',
    message: 'Hot pizza and energy drinks are now available at Main Hall B. Take a quick break and refuel!',
  },
  {
    title: '⏳ 1-Hour Submission Warning',
    message: 'Make sure your GitHub repo is public and Devpost submission is created with demo video.',
  },
];

const INITIAL_LOGS: DispatchedBroadcast[] = [
  {
    id: 'b-1',
    title: 'Opening Keynote in 10 Minutes',
    message: 'Please proceed to Auditorium 10-250 for opening ceremony and track sponsor presentations.',
    target: 'All Registered Hackers (HackMIT)',
    timeAgo: '2 hours ago',
    recipientCount: 840,
  },
];

export const OrganizerBroadcastScreen: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<DispatchedBroadcast[]>(INITIAL_LOGS);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetHackathon, setTargetHackathon] = useState('HackMIT 2026 (840 Hackers)');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSendBroadcast = () => {
    if (!title.trim() || !message.trim()) return;
    setIsSending(true);

    setTimeout(() => {
      const newBroadcast: DispatchedBroadcast = {
        id: `b-${Date.now()}`,
        title: title.trim(),
        message: message.trim(),
        target: targetHackathon,
        timeAgo: 'Just now',
        recipientCount: 840,
      };

      setBroadcasts([newBroadcast, ...broadcasts]);
      setTitle('');
      setMessage('');
      setIsSending(false);
      setSentSuccess(true);

      setTimeout(() => {
        setSentSuccess(false);
      }, 3000);
    }, 600);
  };

  const applyTemplate = (tpl: { title: string; message: string }) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Live Broadcast"
        subtitle="Push Announcements to Participants"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Composer Card */}
        <Card variant="elevated" style={styles.composerCard}>
          <Text style={styles.composerTitle}>COMPOSE ANNOUNCEMENT</Text>

          {sentSuccess && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>
                ✓ Push notification broadcasted to 840 active devices!
              </Text>
            </View>
          )}

          {/* Quick Templates */}
          <Text style={styles.templateLabel}>QUICK TEMPLATES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
            {TEMPLATES.map((tpl, i) => (
              <TouchableOpacity
                key={i}
                style={styles.templateChip}
                onPress={() => applyTemplate(tpl)}
              >
                <Text style={styles.templateChipText} numberOfLines={1}>
                  {tpl.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input
            label="Announcement Title"
            placeholder="e.g. Mentor Office Hours Open"
            value={title}
            onChangeText={setTitle}
          />

          <Input
            label="Message Body"
            placeholder="Write announcement details..."
            multiline={true}
            numberOfLines={3}
            value={message}
            onChangeText={setMessage}
          />

          <Button
            title="Dispatch Live Push Notification"
            variant="organizer"
            isLoading={isSending}
            onPress={handleSendBroadcast}
            style={styles.sendBtn}
          />
        </Card>

        {/* Dispatched History */}
        <Text style={styles.historyTitle}>RECENT BROADCASTS</Text>

        {broadcasts.map((b) => (
          <Card key={b.id} variant="elevated" style={styles.logCard}>
            <View style={styles.logHeader}>
              <Text style={styles.logTitle}>{b.title}</Text>
              <Text style={styles.logTime}>{b.timeAgo}</Text>
            </View>
            <Text style={styles.logMessage}>{b.message}</Text>
            <View style={styles.logFooter}>
              <Badge
                label={`${b.recipientCount} Devices Received`}
                variant="muted"
                size="sm"
              />
              <Text style={styles.logTarget}>{b.target}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.huge,
  },
  composerCard: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.xl,
  },
  composerTitle: {
    ...typography.captionBold,
    color: colors.primaryLight,
    letterSpacing: 1.5,
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
  templateLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    marginBottom: spacing.xs,
  },
  templateScroll: {
    marginBottom: spacing.md,
  },
  templateChip: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
    maxWidth: 220,
  },
  templateChipText: {
    ...typography.captionBold,
    color: colors.textPrimary,
    fontSize: 11,
  },
  sendBtn: {
    marginTop: spacing.md,
  },
  historyTitle: {
    ...typography.captionBold,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  logCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  logTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  logTime: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  logMessage: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: spacing.xs,
  },
  logTarget: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Header, Card, Badge, Button, Input, Icon } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface HostedHackathon {
  id: string;
  title: string;
  organization: string;
  dates: string;
  registeredCount: number;
  capacity: number;
  prizePool: string;
  status: 'active' | 'draft' | 'completed';
}

const INITIAL_HOSTED: HostedHackathon[] = [
  {
    id: 'org-hack-1',
    title: 'HackMIT 2026 — AI Innovation Track',
    organization: 'MIT Tech Club & EECS',
    dates: 'Oct 15 - Oct 17, 2026',
    registeredCount: 840,
    capacity: 1000,
    prizePool: '$50,000 in Prizes',
    status: 'active',
  },
  {
    id: 'org-hack-2',
    title: 'Global Autonomous Agents Hackathon',
    organization: 'SkillSync Open Innovation',
    dates: 'Nov 20 - Nov 22, 2026',
    registeredCount: 580,
    capacity: 800,
    prizePool: '$75,000 in Prizes',
    status: 'active',
  },
];

export const OrganizerHackathonsScreen: React.FC = () => {
  const [hackathons, setHackathons] = useState<HostedHackathon[]>(INITIAL_HOSTED);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOrg, setNewOrg] = useState('MIT Campus Council');
  const [newPrize, setNewPrize] = useState('$30,000');
  const [newCapacity, setNewCapacity] = useState('500');

  const handleCreateHackathon = () => {
    if (!newTitle.trim()) return;
    const newEntry: HostedHackathon = {
      id: `org-hack-${Date.now()}`,
      title: newTitle.trim(),
      organization: newOrg.trim() || 'University Lab',
      dates: 'Dec 01 - Dec 03, 2026',
      registeredCount: 0,
      capacity: parseInt(newCapacity, 10) || 500,
      prizePool: `${newPrize} in Prizes`,
      status: 'active',
    };
    setHackathons([newEntry, ...hackathons]);
    setNewTitle('');
    setModalVisible(false);
  };

  const totalHackers = hackathons.reduce((acc, h) => acc + h.registeredCount, 0);

  return (
    <View style={styles.container}>
      <Header
        title="Organizer Hub"
        subtitle="Manage Hosted Hackathons & Tracks"
        rightAction={
          <Button
            title="+ Create"
            size="sm"
            variant="secondary"
            onPress={() => setModalVisible(true)}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Metrics Row */}
        <View style={styles.metricsRow}>
          <Card variant="elevated" style={styles.metricCard}>
            <Text style={styles.metricValue}>{hackathons.length}</Text>
            <Text style={styles.metricLabel}>HOSTED EVENTS</Text>
          </Card>
          <Card variant="elevated" style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalHackers}</Text>
            <Text style={styles.metricLabel}>REGISTERED HACKERS</Text>
          </Card>
          <Card variant="elevated" style={styles.metricCard}>
            <Text style={styles.metricValue}>$125K</Text>
            <Text style={styles.metricLabel}>TOTAL POOL</Text>
          </Card>
        </View>

        {/* Section Header */}
        <Text style={styles.sectionTitle}>ACTIVE HACKATHONS</Text>

        {hackathons.map((hack) => (
          <Card key={hack.id} variant="elevated" style={styles.hackathonCard}>
            <View style={styles.cardHeader}>
              <View style={styles.titleWrap}>
                <Text style={styles.cardTitle}>{hack.title}</Text>
                <Text style={styles.orgText}>{hack.organization}</Text>
              </View>
              <Badge
                label={hack.status.toUpperCase()}
                variant={hack.status === 'active' ? 'success' : 'muted'}
                size="sm"
              />
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailPill}>
                <Text style={styles.detailLabel}>Dates</Text>
                <Text style={styles.detailText}>{hack.dates}</Text>
              </View>
              <View style={styles.detailPill}>
                <Text style={styles.detailLabel}>Registered</Text>
                <Text style={styles.detailText}>
                  {hack.registeredCount} / {hack.capacity}
                </Text>
              </View>
              <View style={styles.detailPill}>
                <Text style={styles.detailLabel}>Prizes</Text>
                <Text style={styles.detailText}>{hack.prizePool}</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.capacityBar}>
              <View
                style={[
                  styles.capacityFill,
                  { width: `${Math.min(100, (hack.registeredCount / hack.capacity) * 100)}%` },
                ]}
              />
            </View>

            <View style={styles.actionsRow}>
              <Button
                title="View Registrations"
                variant="outline"
                size="sm"
                style={styles.actionBtn}
                onPress={() => {}}
              />
              <Button
                title="Edit Settings"
                variant="ghost"
                size="sm"
                style={styles.actionBtn}
                onPress={() => {}}
              />
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Create Hackathon Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <Card variant="elevated" style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Host New Hackathon</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Input
              label="Hackathon Name"
              placeholder="e.g. AI Genesis Global Hackathon"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Input
              label="Organization / University"
              placeholder="e.g. Stanford EECS Lab"
              value={newOrg}
              onChangeText={setNewOrg}
            />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Input
                  label="Prize Pool"
                  placeholder="$50,000"
                  value={newPrize}
                  onChangeText={setNewPrize}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Capacity"
                  placeholder="500"
                  keyboardType="numeric"
                  value={newCapacity}
                  onChangeText={setNewCapacity}
                />
              </View>
            </View>

            <Button
              title="Publish Hackathon"
              variant="secondary"
              onPress={handleCreateHackathon}
              style={styles.publishBtn}
            />
          </Card>
        </View>
      </Modal>
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
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metricCard: {
    flex: 1,
    padding: spacing.sm + 2,
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  metricValue: {
    ...typography.h2,
    color: colors.primaryLight,
    fontWeight: '800',
  },
  metricLabel: {
    ...typography.captionBold,
    color: colors.textMuted,
    fontSize: 8,
    letterSpacing: 1,
    marginTop: spacing.xxs,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.captionBold,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  hackathonCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  orgText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  detailPill: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  detailText: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  capacityBar: {
    height: 4,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  capacityFill: {
    height: 4,
    backgroundColor: colors.secondary,
    borderRadius: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    padding: spacing.xl,
    backgroundColor: colors.surfaceCard,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  publishBtn: {
    marginTop: spacing.md,
  },
});

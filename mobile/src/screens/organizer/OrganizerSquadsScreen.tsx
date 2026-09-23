import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Header, Card, Badge, Button, Avatar, Icon, getSkillBadgeVariant } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface RegisteredSquad {
  id: string;
  name: string;
  hackathon: string;
  track: string;
  membersCount: number;
  maxMembers: number;
  lead: string;
  members: string[];
  skills: string[];
  checkedIn: boolean;
}

const INITIAL_SQUADS: RegisteredSquad[] = [
  {
    id: 'squad-1',
    name: 'VectorPulse Hackers',
    hackathon: 'HackMIT 2026',
    track: 'Multimodal AI & Agents',
    membersCount: 4,
    maxMembers: 4,
    lead: 'Alex Johnson',
    members: ['Alex Johnson (Lead)', 'Elena Rostova', 'Marcus Chen', 'David Kim'],
    skills: ['React Native', 'PyTorch', 'NestJS', 'Redis'],
    checkedIn: true,
  },
  {
    id: 'squad-2',
    name: 'ZeroKnowledge Guild',
    hackathon: 'HackMIT 2026',
    track: 'Decentralized Identity',
    membersCount: 3,
    maxMembers: 4,
    lead: 'Sophia Wang',
    members: ['Sophia Wang (Lead)', 'Liam Patel', 'Emma Davis'],
    skills: ['Rust', 'Solidity', 'TypeScript', 'ZKP'],
    checkedIn: false,
  },
  {
    id: 'squad-3',
    name: 'NeuralBio Health',
    hackathon: 'Global Agents Hackathon',
    track: 'Biomedical Imaging',
    membersCount: 2,
    maxMembers: 4,
    lead: 'Dr. Ryan Zhang',
    members: ['Dr. Ryan Zhang', 'Chloe Moreau'],
    skills: ['Python', 'Computer Vision', 'FastAPI'],
    checkedIn: false,
  },
];

export const OrganizerSquadsScreen: React.FC = () => {
  const [squads, setSquads] = useState<RegisteredSquad[]>(INITIAL_SQUADS);
  const [filterTrack, setFilterTrack] = useState<string>('All');

  const toggleCheckIn = (id: string) => {
    setSquads((prev) =>
      prev.map((sq) =>
        sq.id === id ? { ...sq, checkedIn: !sq.checkedIn } : sq
      )
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Squad Rosters"
        subtitle="Review, Verify & Check-In Teams"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Track Filters */}
        <View style={styles.filterRow}>
          {['All', 'Multimodal AI', 'Identity', 'Biomedical'].map((track) => (
            <TouchableOpacity
              key={track}
              style={[
                styles.filterPill,
                filterTrack === track && styles.filterPillActive,
              ]}
              onPress={() => setFilterTrack(track)}
            >
              <Text
                style={[
                  styles.filterText,
                  filterTrack === track && styles.filterTextActive,
                ]}
              >
                {track}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {squads.map((squad) => (
          <Card key={squad.id} variant="elevated" style={styles.squadCard}>
            <View style={styles.squadHeader}>
              <View style={styles.squadInfo}>
                <Text style={styles.squadName}>{squad.name}</Text>
                <Text style={styles.hackathonName}>
                  {squad.hackathon} • {squad.track}
                </Text>
              </View>

              <Badge
                label={squad.checkedIn ? 'CHECKED IN' : 'REGISTERED'}
                variant={squad.checkedIn ? 'active' : 'upcoming'}
                size="sm"
              />
            </View>

            {/* Members Roster */}
            <Text style={styles.rosterTitle}>
              TEAM ROSTER ({squad.membersCount}/{squad.maxMembers})
            </Text>
            <View style={styles.membersList}>
              {squad.members.map((m, idx) => (
                <Text key={idx} style={styles.memberItem}>
                  • {m}
                </Text>
              ))}
            </View>

            {/* Skills Badges (Category-Coded Chips) */}
            <View style={styles.skillsRow}>
              {squad.skills.map((s, idx) => (
                <Badge key={idx} label={s} variant={getSkillBadgeVariant(s)} size="sm" />
              ))}
            </View>

            {/* Check-In Action Button */}
            <View style={styles.actionsRow}>
              <Button
                title={squad.checkedIn ? 'Undo Check-In' : 'Verify & Check-In Squad'}
                variant={squad.checkedIn ? 'outlineOrganizer' : 'organizer'}
                size="sm"
                onPress={() => toggleCheckIn(squad.id)}
                style={styles.checkInBtn}
              />
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
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  filterPillActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.primaryLight,
  },
  squadCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  squadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  squadInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  squadName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  hackathonName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rosterTitle: {
    ...typography.captionBold,
    color: colors.textMuted,
    fontSize: 9,
    letterSpacing: 1,
    marginTop: spacing.xs,
    marginBottom: spacing.xxs,
  },
  membersList: {
    marginBottom: spacing.sm,
  },
  memberItem: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
  },
  checkInBtn: {
    flex: 1,
  },
});

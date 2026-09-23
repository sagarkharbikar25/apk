import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TeamsStackParamList } from '../../navigation/types';
import { useTeamsStore } from '../../store/teamsStore';
import { Button, Card, Badge, Avatar, Header, LoadingScreen } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { QRShareModal } from './QRShareModal';

type Props = NativeStackScreenProps<TeamsStackParamList, 'TeamDetail'>;

export const TeamDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { teamId } = route.params;
  const { activeTeam, fetchTeamById, isLoading } = useTeamsStore();
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    fetchTeamById(teamId);
  }, [teamId, fetchTeamById]);

  if (isLoading && !activeTeam) {
    return (
      <LoadingScreen
        message="Loading Team Dashboard..."
        subtitle="Fetching team roster & project details"
      />
    );
  }

  const team = activeTeam;
  const memberCount = team?.members?.length || 0;
  const maxCapacity = team?.maxMembers || 4;
  const isFull = memberCount >= maxCapacity;

  return (
    <View style={styles.container}>
      <Header
        title={team?.name || 'Team Details'}
        subtitle={`Roster: ${memberCount} / ${maxCapacity} Members`}
        onBack={() => navigation.goBack()}
        rightAction={
          <Button
            title="QR Code"
            variant="outline"
            size="sm"
            onPress={() => setShowQRModal(true)}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Team Overview Card */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.teamTitle}>{team?.name}</Text>
            <Badge
              label={isFull ? 'FULL' : `${maxCapacity - memberCount} SLOTS OPEN`}
              variant={isFull ? 'warning' : 'success'}
              size="sm"
            />
          </View>

          {team?.hackathonId && (
            <Text style={styles.hackathonBadge}>
              🏆 Target Event: {team.hackathonId}
            </Text>
          )}

          <Text style={styles.descText}>
            {team?.description || 'No description provided for this hackathon squad.'}
          </Text>

          {/* Member Capacity Progress */}
          <View style={styles.capacityMeter}>
            <View style={styles.meterHeader}>
              <Text style={styles.meterLabel}>Squad Formation</Text>
              <Text style={styles.meterValue}>
                {memberCount} of {maxCapacity} hackers
              </Text>
            </View>
            <View style={styles.meterBg}>
              <View
                style={[
                  styles.meterFill,
                  { width: `${Math.min(100, (memberCount / maxCapacity) * 100)}%` },
                ]}
              />
            </View>
          </View>

          <Button
            title="Share Team QR Code"
            variant="primary"
            onPress={() => setShowQRModal(true)}
            style={styles.shareBtn}
          />
        </Card>

        {/* Member List Section */}
        <Text style={styles.sectionHeader}>TEAM MEMBERS ({memberCount})</Text>

        {team?.members?.map((member) => (
          <Card key={member.id} style={styles.memberCard}>
            <Avatar
              uri={member.user?.avatarUrl}
              name={member.user?.name || 'Member'}
              size={46}
              showOnlineStatus={true}
              isOnline={true}
            />
            <View style={styles.memberInfo}>
              <View style={styles.memberHeaderRow}>
                <Text style={styles.memberName}>{member.user?.name}</Text>
                <Badge
                  label={member.role.toUpperCase()}
                  variant={member.role === 'leader' ? 'primary' : 'muted'}
                  size="sm"
                />
              </View>
              <Text style={styles.memberCollege}>
                {member.user?.college || 'Student Developer'}
              </Text>
              <Text style={styles.memberEmail}>{member.user?.email}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>

      {team && (
        <QRShareModal
          visible={showQRModal}
          onClose={() => setShowQRModal(false)}
          teamName={team.name}
          qrToken={team.qrCode || `qr-${team.id}`}
        />
      )}
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
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  teamTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  hackathonBadge: {
    ...typography.captionBold,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  descText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  capacityMeter: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  meterLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  meterValue: {
    ...typography.captionBold,
    color: colors.studentAccent,
  },
  meterBg: {
    height: 6,
    backgroundColor: colors.surfaceBorder,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    backgroundColor: colors.studentAccent,
    borderRadius: borderRadius.full,
  },
  shareBtn: {
    marginTop: spacing.xs,
  },
  sectionHeader: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  memberInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  memberHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  memberCollege: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  memberEmail: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TeamsStackParamList } from '../../navigation/types';
import { useTeamsStore, Team } from '../../store/teamsStore';
import { Card, Badge, Avatar, Button, Header, LoadingScreen } from '../../components/ui';
import { colors, typography, spacing } from '../../theme';

type Props = NativeStackScreenProps<TeamsStackParamList, 'TeamsList'>;

export const TeamsListScreen: React.FC<Props> = ({ navigation }) => {
  const { teams, fetchTeams, isLoading } = useTeamsStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeams();
    setRefreshing(false);
  };

  const handleSelectTeam = (team: Team) => {
    navigation.navigate('TeamDetail', { teamId: team.id });
  };

  if (isLoading && teams.length === 0) {
    return (
      <LoadingScreen
        message="Loading Hackathon Squads..."
        subtitle="Retrieving active teams and rosters"
      />
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Hackathon Teams"
        subtitle="Collaborate, recruit, and conquer hackathons"
        rightAction={
          <View style={styles.headerActions}>
            <Button
              title="📷 Scan QR"
              variant="outline"
              size="sm"
              onPress={() => navigation.navigate('QRScanner')}
            />
            <Button
              title="+ Create"
              size="sm"
              onPress={() => navigation.navigate('CreateTeam')}
            />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {teams.length === 0 ? (
          <Card variant="elevated" style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Teams Formed Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your own hackathon squad or join an existing one by scanning their QR code.
            </Text>
            <Button
              title="Create First Team"
              onPress={() => navigation.navigate('CreateTeam')}
              style={styles.emptyBtn}
            />
          </Card>
        ) : (
          teams.map((team) => {
            const memberCount = team.members?.length || 0;
            const maxCap = team.maxMembers || 4;
            const isFull = memberCount >= maxCap;

            return (
              <Card
                key={team.id}
                variant="elevated"
                style={styles.teamCard}
                onPress={() => handleSelectTeam(team)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.teamName} numberOfLines={1}>
                    {team.name}
                  </Text>
                  <Badge
                    label={`${memberCount} / ${maxCap} Members`}
                    variant={isFull ? 'warning' : 'success'}
                    size="sm"
                  />
                </View>

                {team.hackathonId && (
                  <Text style={styles.hackathonAffiliation}>
                    🏆 {team.hackathonId}
                  </Text>
                )}

                <Text style={styles.description} numberOfLines={2}>
                  {team.description || 'Passionate builders aiming for the prize track.'}
                </Text>

                {/* Member Avatars Stack */}
                <View style={styles.membersRow}>
                  <View style={styles.avatarsStack}>
                    {team.members?.slice(0, 4).map((m, idx) => (
                      <View
                        key={m.id}
                        style={[
                          styles.avatarWrap,
                          idx > 0 && styles.avatarStacked,
                        ]}
                      >
                        <Avatar
                          uri={m.user?.avatarUrl}
                          name={m.user?.name || 'Hacker'}
                          size={32}
                        />
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.viewRosterBtn}
                    onPress={() => handleSelectTeam(team)}
                  >
                    <Text style={styles.viewRosterText}>View Roster →</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.huge,
  },
  teamCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  teamName: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  hackathonAffiliation: {
    ...typography.captionBold,
    color: colors.secondaryLight,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  membersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: spacing.sm,
  },
  avatarsStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: 16,
  },
  avatarStacked: {
    marginLeft: -10,
  },
  viewRosterBtn: {
    paddingVertical: spacing.xs,
  },
  viewRosterText: {
    ...typography.captionBold,
    color: colors.primaryLight,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyBtn: {
    minWidth: 160,
  },
});

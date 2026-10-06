import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useHackathonsStore, Hackathon } from '../../store/hackathonsStore';
import { Header, Card, Badge, Button, LoadingScreen } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { RegisterHackathonModal } from './RegisterHackathonModal';

export const HackathonsListScreen: React.FC = () => {
  const { hackathons, fetchHackathons, isLoading } = useHackathonsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);

  useEffect(() => {
    fetchHackathons();
  }, [fetchHackathons]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHackathons();
    setRefreshing(false);
  };

  const getDaysRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} Days Left` : 'Closed';
  };

  if (isLoading && hackathons.length === 0) {
    return (
      <LoadingScreen
        message="Loading Hackathons..."
        subtitle="Finding top upcoming collegiate hackathons"
      />
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Hackathons"
        subtitle="Compete, innovate, and win prizes"
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
        {hackathons.map((hackathon) => {
          const daysLeft = getDaysRemaining(hackathon.registrationDeadline);

          return (
            <Card key={hackathon.id} variant="elevated" style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.titleArea}>
                  <Text style={styles.title}>{hackathon.title}</Text>
                  <Text style={styles.location}>📍 {hackathon.location || 'Online'}</Text>
                </View>
                <Badge
                  label={daysLeft}
                  variant={daysLeft === 'Closed' ? 'error' : 'primary'}
                  size="sm"
                />
              </View>

              <Text style={styles.description}>{hackathon.description}</Text>

              {/* Event Metrics Pills */}
              <View style={styles.metricsRow}>
                {hackathon.prizePool && (
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Prizes</Text>
                    <Text style={styles.metricValue}>{hackathon.prizePool}</Text>
                  </View>
                )}

                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Max Team</Text>
                  <Text style={styles.metricValue}>{hackathon.maxTeamSize} Hackers</Text>
                </View>

                {hackathon.participantCount && (
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Hackers</Text>
                    <Text style={styles.metricValue}>{hackathon.participantCount}+ Registered</Text>
                  </View>
                )}
              </View>

              <Button
                title="Register Now"
                variant="primary"
                onPress={() => setSelectedHackathon(hackathon)}
                style={styles.registerBtn}
              />
            </Card>
          );
        })}
      </ScrollView>

      {selectedHackathon && (
        <RegisterHackathonModal
          visible={!!selectedHackathon}
          onClose={() => setSelectedHackathon(null)}
          hackathonId={selectedHackathon.id}
          hackathonTitle={selectedHackathon.title}
          maxTeamSize={selectedHackathon.maxTeamSize}
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
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  titleArea: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h2,
    fontSize: 20,
    color: colors.textPrimary,
  },
  location: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
    marginVertical: spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  metricValue: {
    ...typography.captionBold,
    color: colors.primaryLight,
    marginTop: 1,
  },
  registerBtn: {
    marginTop: spacing.xs,
  },
});

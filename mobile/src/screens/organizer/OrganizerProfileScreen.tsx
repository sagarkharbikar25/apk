import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Header, Card, Badge, Avatar, Button, Icon } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing, borderRadius } from '../../theme';

export const OrganizerProfileScreen: React.FC = () => {
  const { user, logout, setSession } = useAuthStore();

  const handleSwitchToStudent = () => {
    setSession(
      {
        id: 'usr-demo-std',
        email: 'alex.chen@mit.edu',
        name: 'Alex Chen',
        role: 'student',
        isVerified: true,
        createdAt: new Date().toISOString(),
      },
      {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      }
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Organizer Account"
        subtitle="Permissions & System Profile"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Identity Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <Avatar
              name={user?.name || 'Sarah Lin'}
              size={76}
              showOnlineStatus={true}
              isOnline={true}
            />
            <View style={styles.infoCol}>
              <Text style={styles.nameText}>{user?.name || 'Sarah Lin'}</Text>
              <Text style={styles.emailText}>{user?.email || 'organizer@hackmit.org'}</Text>
              <View style={styles.badgeRow}>
                <Badge label="ORGANIZER" variant="organizer" size="sm" />
                <Badge label="VERIFIED ORG" variant="upcoming" size="sm" />
              </View>
            </View>
          </View>
        </Card>

        {/* Organization Scope */}
        <Card variant="elevated" style={styles.orgCard}>
          <Text style={styles.sectionHeader}>ORGANIZATION & COUNCIL</Text>
          <View style={styles.orgRow}>
            <Text style={styles.orgLabel}>Affiliation</Text>
            <Text style={styles.orgValue}>MIT EECS Tech Council</Text>
          </View>
          <View style={styles.orgRow}>
            <Text style={styles.orgLabel}>Hosting Tier</Text>
            <Text style={styles.orgValue}>Enterprise Campus Host</Text>
          </View>
          <View style={styles.orgRow}>
            <Text style={styles.orgLabel}>Active Events</Text>
            <Text style={styles.orgValue}>2 Live Hackathons</Text>
          </View>
        </Card>

        {/* Role Switching & Actions */}
        <Card variant="elevated" style={styles.actionsCard}>
          <Text style={styles.sectionHeader}>ROLE SWITCH & DEMO CONTROLS</Text>
          <Button
            title="Switch to Student / Hacker View"
            variant="outlineOrganizer"
            onPress={handleSwitchToStudent}
            style={styles.switchBtn}
          />
          <Button
            title="Sign Out"
            variant="danger"
            onPress={logout}
            style={styles.logoutBtn}
          />
        </Card>
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
  profileCard: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCol: {
    marginLeft: spacing.md,
    flex: 1,
  },
  nameText: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  emailText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  orgCard: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    ...typography.captionBold,
    color: colors.primaryLight,
    letterSpacing: 1.2,
    marginBottom: spacing.md,
  },
  orgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  orgLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  orgValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  actionsCard: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  switchBtn: {
    marginBottom: spacing.sm,
  },
  logoutBtn: {
    marginTop: spacing.xs,
  },
});

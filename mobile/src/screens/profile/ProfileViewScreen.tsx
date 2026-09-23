import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import { Button, Card, Badge, Avatar, LoadingScreen, Icon, getSkillBadgeVariant } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { ExtractSkillsModal } from './ExtractSkillsModal';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileView'>;

export const ProfileViewScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, skills, isLoading, fetchProfile, fetchCatalog, extractSkillsFromBio } = useProfileStore();
  const { user: authUser, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchCatalog();
  }, [fetchCatalog, fetchProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleExtractSkills = async () => {
    const bioText = profile?.bio || authUser?.bio || 'Full stack developer with React Native and NestJS';
    setAiModalVisible(true);
    await extractSkillsFromBio(bioText);
  };

  const openUrl = (url?: string | null) => {
    if (url) {
      Linking.openURL(url).catch(() => {});
    }
  };

  const user = profile || authUser;

  if (isLoading && !user) {
    return (
      <LoadingScreen
        message="Syncing Developer Profile..."
        subtitle="Retrieving verified skills and hackathon stats"
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Profile Header Card */}
      <Card variant="elevated" style={styles.headerCard}>
        <View style={styles.avatarRow}>
          <Avatar
            uri={user?.avatarUrl}
            name={user?.name || 'Hacker'}
            size={76}
            showOnlineStatus={true}
            isOnline={true}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{user?.name || 'Developer'}</Text>
            <Text style={styles.userCollege}>{user?.college || 'Computer Science'}</Text>
            <View style={styles.tagsRow}>
              <Badge
                label={user?.role?.toUpperCase() || 'STUDENT'}
                variant={user?.role === 'organizer' ? 'secondary' : 'primary'}
                size="sm"
              />
              {user?.lookingFor && (
                <Badge
                  label={`Looking for: ${user.lookingFor}`}
                  variant="secondary"
                  size="sm"
                />
              )}
            </View>
          </View>
        </View>

        {/* Weekly Availability Meter */}
        <View style={styles.availabilityBox}>
          <View style={styles.availabilityRow}>
            <Text style={styles.availabilityLabel}>Weekly Availability</Text>
            <Text style={styles.availabilityValue}>
              {user?.availableHoursWeek || 15} hrs / week
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, ((user?.availableHoursWeek || 15) / 40) * 100)}%` },
              ]}
            />
          </View>
        </View>
      </Card>

      {/* Bio Section */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>About & Bio</Text>
        <Text style={styles.bioText}>
          {user?.bio || 'Passionate student builder eager to collaborate on innovative hackathon solutions!'}
        </Text>

        {/* Social / Portfolio Links */}
        <View style={styles.linksRow}>
          {user?.githubUrl && (
            <TouchableOpacity
              style={styles.linkChip}
              onPress={() => openUrl(user.githubUrl)}
            >
              <Text style={styles.linkText}>GitHub ↗</Text>
            </TouchableOpacity>
          )}
          {user?.linkedinUrl && (
            <TouchableOpacity
              style={styles.linkChip}
              onPress={() => openUrl(user.linkedinUrl)}
            >
              <Text style={styles.linkText}>LinkedIn ↗</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>

      {/* Skills Section */}
      <Card style={styles.sectionCard}>
        <View style={styles.skillsHeader}>
          <View>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            <Text style={styles.skillsSubtitle}>{skills.length} skills listed</Text>
          </View>
          <Button
            title="Manage"
            variant="outline"
            size="sm"
            onPress={() => navigation.navigate('SkillsManage')}
          />
        </View>

        {skills.length === 0 ? (
          <View style={styles.emptySkillsBox}>
            <Text style={styles.emptySkillsText}>
              You haven't added any skills yet.
            </Text>
          </View>
        ) : (
          <View style={styles.skillsGrid}>
            {skills.map((item) => (
              <Badge
                key={item.id}
                label={`${item.skill?.name || 'Skill'} (${item.proficiencyLevel})`}
                variant={getSkillBadgeVariant(item.skill?.name || '')}
                size="md"
              />
            ))}
          </View>
        )}

        {/* AI Skill Extraction Trigger */}
        <Button
          title="Extract Skills with Gemini AI"
          leftIcon={<Icon name="sparkle" size={16} color={colors.textPrimary} style={{ marginRight: 8 }} />}
          variant="secondary"
          onPress={handleExtractSkills}
          style={styles.aiExtractBtn}
        />
      </Card>

      {/* Actions */}
      <View style={styles.actionButtons}>
        <Button
          title="Edit Profile"
          variant="outline"
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.editBtn}
        />
        <Button
          title="Sign Out"
          variant="danger"
          onPress={logout}
          style={styles.logoutBtn}
        />
      </View>

      <ExtractSkillsModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
        bioText={user?.bio || ''}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.huge,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md,
  },
  skeleton: {
    marginBottom: spacing.md,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  userName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  userCollege: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  availabilityBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  availabilityLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  availabilityValue: {
    ...typography.captionBold,
    color: colors.studentAccent,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.surfaceBorder,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.studentAccent,
    borderRadius: borderRadius.full,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  bioText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  linksRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  linkChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  linkText: {
    ...typography.captionBold,
    color: colors.studentAccent,
  },
  skillsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  skillsSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  emptySkillsBox: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  emptySkillsText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  aiExtractBtn: {
    marginTop: spacing.xs,
  },
  actionButtons: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  editBtn: {
    marginBottom: spacing.xs,
  },
  logoutBtn: {},
});

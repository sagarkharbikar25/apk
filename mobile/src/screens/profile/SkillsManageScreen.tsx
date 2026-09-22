import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types';
import { useProfileStore } from '../../store/profileStore';
import { Button, Input, Card, Badge } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SkillsManage'>;

const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

export const SkillsManageScreen: React.FC<Props> = ({ navigation }) => {
  const { skills, catalog, addSkill, removeSkill, error } = useProfileStore();

  const [search, setSearch] = useState('');
  const [selectedCatalogSkillId, setSelectedCatalogSkillId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<
    'beginner' | 'intermediate' | 'advanced' | 'expert'
  >('intermediate');
  const [isAdding, setIsAdding] = useState(false);

  // Existing user skill IDs
  const userSkillIds = new Set(skills.map((s) => s.skillId));

  // Filter available skills
  const filteredCatalog = catalog.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const notAddedYet = !userSkillIds.has(item.id);
    return matchesSearch && notAddedYet;
  });

  const handleAdd = async () => {
    if (!selectedCatalogSkillId) return;
    setIsAdding(true);
    await addSkill(selectedCatalogSkillId, selectedLevel);
    setSelectedCatalogSkillId(null);
    setIsAdding(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Current Skills Section */}
      <Card variant="elevated" style={styles.card}>
        <Text style={styles.cardTitle}>Your Skills ({skills.length})</Text>
        <Text style={styles.cardSubtitle}>
          Tap the remove icon to delete a skill from your profile
        </Text>

        {skills.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No skills added yet.</Text>
          </View>
        ) : (
          <View style={styles.chipsWrap}>
            {skills.map((userSkill) => (
              <Badge
                key={userSkill.id}
                label={`${userSkill.skill?.name || 'Skill'} (${userSkill.proficiencyLevel})`}
                variant="primary"
                size="md"
                onRemove={() => removeSkill(userSkill.id)}
              />
            ))}
          </View>
        )}
      </Card>

      {/* Add New Skill Section */}
      <Card variant="elevated" style={styles.card}>
        <Text style={styles.cardTitle}>Add New Skill</Text>
        <Text style={styles.cardSubtitle}>
          Select a skill and set your proficiency level
        </Text>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        <Input
          label="Search Skills"
          placeholder="e.g. React Native, Docker, NestJS"
          value={search}
          onChangeText={setSearch}
        />

        {/* Proficiency Level Selector */}
        <Text style={styles.levelLabel}>PROFICIENCY LEVEL</Text>
        <View style={styles.levelRow}>
          {PROFICIENCY_LEVELS.map((lvl) => (
            <TouchableOpacity
              key={lvl}
              activeOpacity={0.8}
              style={[
                styles.levelPill,
                selectedLevel === lvl && styles.levelPillActive,
              ]}
              onPress={() => setSelectedLevel(lvl)}
            >
              <Text
                style={[
                  styles.levelText,
                  selectedLevel === lvl && styles.levelTextActive,
                ]}
              >
                {lvl[0].toUpperCase() + lvl.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Catalog List */}
        <Text style={styles.catalogLabel}>SELECT SKILL TO ADD</Text>
        <View style={styles.catalogList}>
          {filteredCatalog.slice(0, 12).map((item) => {
            const isSelected = selectedCatalogSkillId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => setSelectedCatalogSkillId(item.id)}
                style={[
                  styles.catalogItem,
                  isSelected && styles.catalogItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.catalogItemText,
                    isSelected && styles.catalogItemTextActive,
                  ]}
                >
                  {item.name}
                </Text>
                <Text style={styles.categoryBadge}>{item.category}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title="Add Selected Skill"
          onPress={handleAdd}
          isLoading={isAdding}
          disabled={!selectedCatalogSkillId}
          style={styles.addBtn}
        />
      </Card>

      <Button
        title="Done"
        variant="outline"
        onPress={() => navigation.goBack()}
        style={styles.doneBtn}
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
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  emptyBox: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  errorBanner: {
    backgroundColor: colors.errorSubtle,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    ...typography.captionBold,
    color: colors.error,
    textAlign: 'center',
  },
  levelLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  levelRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  levelPill: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  levelPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  levelText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  levelTextActive: {
    color: colors.primaryLight,
  },
  catalogLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  catalogList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  catalogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: spacing.xs,
  },
  catalogItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  catalogItemText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  catalogItemTextActive: {
    color: colors.primaryLight,
  },
  categoryBadge: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  addBtn: {
    marginTop: spacing.xs,
  },
  doneBtn: {
    marginTop: spacing.xs,
  },
});

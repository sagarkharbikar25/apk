import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button, Card } from '../../components/ui';

export interface FilterCriteria {
  type: 'all' | 'candidate' | 'project';
  category: string;
  minScore: number;
  minHours: number;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  criteria: FilterCriteria;
  onApply: (newCriteria: FilterCriteria) => void;
}

const CATEGORIES = ['All', 'Frontend', 'Backend', 'AI/Data', 'DevOps', 'Mobile', 'Design'];
const SCORE_OPTIONS = [0, 50, 70, 85];
const HOURS_OPTIONS = [0, 10, 15, 20];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  criteria,
  onApply,
}) => {
  const [type, setType] = useState(criteria.type);
  const [category, setCategory] = useState(criteria.category);
  const [minScore, setMinScore] = useState(criteria.minScore);
  const [minHours, setMinHours] = useState(criteria.minHours);

  const handleReset = () => {
    setType('all');
    setCategory('All');
    setMinScore(0);
    setMinHours(0);
  };

  const handleApply = () => {
    onApply({
      type,
      category,
      minScore,
      minHours,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Card variant="elevated" style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Recommendations</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Recommendation Type */}
            <Text style={styles.sectionLabel}>RECOMMENDATION TYPE</Text>
            <View style={styles.optionsRow}>
              {(['all', 'candidate', 'project'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.pill, type === t && styles.pillActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.pillText, type === t && styles.pillTextActive]}>
                    {t === 'all' ? 'All' : t === 'candidate' ? 'Teammates' : 'Projects'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Skill Category */}
            <Text style={styles.sectionLabel}>DOMAIN CATEGORY</Text>
            <View style={styles.wrapRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Minimum Match Score */}
            <Text style={styles.sectionLabel}>MINIMUM MATCH SCORE</Text>
            <View style={styles.optionsRow}>
              {SCORE_OPTIONS.map((score) => (
                <TouchableOpacity
                  key={score}
                  style={[styles.pill, minScore === score && styles.pillActive]}
                  onPress={() => setMinScore(score)}
                >
                  <Text style={[styles.pillText, minScore === score && styles.pillTextActive]}>
                    {score === 0 ? 'Any' : `${score}%+`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Minimum Weekly Hours */}
            <Text style={styles.sectionLabel}>MINIMUM WEEKLY AVAILABILITY</Text>
            <View style={styles.optionsRow}>
              {HOURS_OPTIONS.map((hrs) => (
                <TouchableOpacity
                  key={hrs}
                  style={[styles.pill, minHours === hrs && styles.pillActive]}
                  onPress={() => setMinHours(hrs)}
                >
                  <Text style={[styles.pillText, minHours === hrs && styles.pillTextActive]}>
                    {hrs === 0 ? 'Any' : `${hrs}h+ / wk`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Reset"
              variant="ghost"
              onPress={handleReset}
              style={styles.resetBtn}
            />
            <Button
              title="Apply Filters"
              onPress={handleApply}
              style={styles.applyBtn}
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
    justifyContent: 'flex-end',
  },
  card: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: '85%',
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeText: {
    ...typography.h3,
    color: colors.textMuted,
  },
  body: {
    marginVertical: spacing.sm,
  },
  sectionLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  pill: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  pillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  pillText: {
    ...typography.captionBold,
    color: colors.textMuted,
  },
  pillTextActive: {
    color: colors.primaryLight,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  chipText: {
    ...typography.captionBold,
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.primaryLight,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  resetBtn: {
    flex: 1,
  },
  applyBtn: {
    flex: 2,
  },
});

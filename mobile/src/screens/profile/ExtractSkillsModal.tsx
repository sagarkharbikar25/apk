import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button, Card, Icon } from '../../components/ui';
import { useProfileStore } from '../../store/profileStore';

interface ExtractSkillsModalProps {
  visible: boolean;
  onClose: () => void;
  bioText: string;
}

export const ExtractSkillsModal: React.FC<ExtractSkillsModalProps> = ({
  visible,
  onClose,
  bioText: _bioText,
}) => {
  const {
    aiSuggestedSkills,
    isExtracting,
    catalog,
    addSkill,
    clearAiSuggestions,
  } = useProfileStore();

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const toggleSelect = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  const handleConfirmAdd = async () => {
    if (selectedSkills.length === 0) return;
    setIsAdding(true);

    for (const skillName of selectedSkills) {
      // Find matching skill in catalog or fallback
      const match = catalog.find(
        (c) => c.name.toLowerCase() === skillName.toLowerCase()
      );
      if (match) {
        await addSkill(match.id, 'intermediate');
      }
    }

    setIsAdding(false);
    setSelectedSkills([]);
    clearAiSuggestions();
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
        <Card variant="elevated" style={styles.modalCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>AI Skill Extraction</Text>
              <Text style={styles.subtitle}>Powered by Google Gemini</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {isExtracting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>
                Analyzing your bio & extracting technical proficiencies...
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.instructions}>
                Gemini detected the following technical proficiencies in your bio.
                Tap to select the skills you want to add to your profile:
              </Text>

              <ScrollView style={styles.chipsScroll}>
                <View style={styles.chipsContainer}>
                  {aiSuggestedSkills.map((skillName, index) => {
                    const isSelected = selectedSkills.includes(skillName);
                    return (
                      <TouchableOpacity
                        key={`${skillName}-${index}`}
                        activeOpacity={0.7}
                        onPress={() => toggleSelect(skillName)}
                        style={[
                          styles.chip,
                          isSelected && styles.chipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextSelected,
                          ]}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {skillName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <View style={styles.actionRow}>
                <Button
                  title="Cancel"
                  variant="ghost"
                  onPress={onClose}
                  style={styles.cancelBtn}
                />
                <Button
                  title={`Add ${selectedSkills.length} Selected`}
                  variant="primary"
                  disabled={selectedSkills.length === 0}
                  isLoading={isAdding}
                  onPress={handleConfirmAdd}
                  style={styles.confirmBtn}
                />
              </View>
            </>
          )}
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    padding: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.captionBold,
    color: colors.studentAccent,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeText: {
    ...typography.h3,
    color: colors.textMuted,
  },
  loadingContainer: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  instructions: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  chipsScroll: {
    maxHeight: 220,
    marginVertical: spacing.sm,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surfaceElevated,
  },
  chipSelected: {
    borderColor: colors.studentAccent,
    backgroundColor: colors.surfaceElevated,
  },
  chipText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.studentAccent,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  cancelBtn: {
    minWidth: 80,
  },
  confirmBtn: {
    flex: 1,
  },
});

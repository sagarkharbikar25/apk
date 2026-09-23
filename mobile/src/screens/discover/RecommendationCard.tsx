import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { RecommendationItem } from '../../api/types';
import { Card, Badge, Avatar, Button, getSkillBadgeVariant } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface RecommendationCardProps {
  item: RecommendationItem;
  onConnect?: (item: RecommendationItem) => void;
  onPress?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  onConnect,
  onPress,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const toggleBreakdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowBreakdown(!showBreakdown);
  };

  const scorePercentage = Math.round(item.matchScore * 100);

  // Dynamic Score Band Logic:
  // 90–100%: Teal-green (#14E1C4)
  // 70–89%: Trophy Gold (#FFB020)
  // <70%: Slate (#6B7280)
  const getScoreColor = (score: number) => {
    if (score >= 90) return colors.matchHigh;
    if (score >= 70) return colors.matchMed;
    return colors.matchLow;
  };

  const scoreColor = getScoreColor(scorePercentage);

  return (
    <Card variant="elevated" style={styles.card} onPress={onPress}>
      {/* Top Header: Avatar, Name/Title, Match Score */}
      <View style={styles.headerRow}>
        <Avatar
          uri={item.avatarUrl}
          name={item.title}
          size={50}
          showOnlineStatus={item.type === 'candidate'}
          isOnline={true}
        />
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
          {item.college && (
            <Text style={styles.collegeText} numberOfLines={1}>
              🏫 {item.college}
            </Text>
          )}
        </View>

        {/* Dynamic Match Score Ring Badge */}
        <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>
            {scorePercentage}%
          </Text>
          <Text style={[styles.scoreLabel, { color: scoreColor }]}>MATCH</Text>
        </View>
      </View>

      {/* Description / Summary */}
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      {/* Skills Row (Category-Coded Chips) */}
      <View style={styles.skillsRow}>
        {item.skills.slice(0, 4).map((skill, idx) => (
          <Badge
            key={`${skill}-${idx}`}
            label={skill}
            variant={getSkillBadgeVariant(skill)}
            size="sm"
          />
        ))}
        {item.skills.length > 4 && (
          <Badge
            label={`+${item.skills.length - 4} more`}
            variant="more"
            size="sm"
          />
        )}
      </View>

      {/* Explainable AI Score Trigger */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleBreakdown}
        style={styles.breakdownToggle}
      >
        <Text style={styles.breakdownToggleText}>
          {showBreakdown ? '▲ Hide AI Match Breakdown' : '▼ View AI Match Breakdown & Reasoning'}
        </Text>
      </TouchableOpacity>

      {/* Collapsible Explainability Section */}
      {showBreakdown && (
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>Explainable Scoring Factors</Text>

          {/* 5-Factor Score Meters */}
          <View style={styles.factorItem}>
            <View style={styles.factorHeader}>
              <Text style={styles.factorName}>Skill Overlap (40%)</Text>
              <Text style={styles.factorScore}>
                {Math.round(item.breakdown.skillCoverage * 100)}%
              </Text>
            </View>
            <View style={styles.meterBg}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${Math.round(item.breakdown.skillCoverage * 100)}%`,
                    backgroundColor: colors.student,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.factorItem}>
            <View style={styles.factorHeader}>
              <Text style={styles.factorName}>Complementary Skills (25%)</Text>
              <Text style={styles.factorScore}>
                {Math.round(item.breakdown.complementarySkills * 100)}%
              </Text>
            </View>
            <View style={styles.meterBg}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${Math.round(item.breakdown.complementarySkills * 100)}%`,
                    backgroundColor: colors.categoryBackend,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.factorItem}>
            <View style={styles.factorHeader}>
              <Text style={styles.factorName}>Availability Match (15%)</Text>
              <Text style={styles.factorScore}>
                {Math.round(item.breakdown.availabilityMatch * 100)}%
              </Text>
            </View>
            <View style={styles.meterBg}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${Math.round(item.breakdown.availabilityMatch * 100)}%`,
                    backgroundColor: colors.success,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.factorItem}>
            <View style={styles.factorHeader}>
              <Text style={styles.factorName}>Domain Interest (10%)</Text>
              <Text style={styles.factorScore}>
                {Math.round(item.breakdown.interestOverlap * 100)}%
              </Text>
            </View>
            <View style={styles.meterBg}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${Math.round(item.breakdown.interestOverlap * 100)}%`,
                    backgroundColor: colors.organizer,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.factorItem}>
            <View style={styles.factorHeader}>
              <Text style={styles.factorName}>Experience Level (10%)</Text>
              <Text style={styles.factorScore}>
                {Math.round(item.breakdown.experienceLevel * 100)}%
              </Text>
            </View>
            <View style={styles.meterBg}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${Math.round(item.breakdown.experienceLevel * 100)}%`,
                    backgroundColor: colors.categoryAI,
                  },
                ]}
              />
            </View>
          </View>

          {/* Gemini AI Reasoning Points */}
          {item.aiReasoning && item.aiReasoning.length > 0 && (
            <View style={styles.reasoningBox}>
              <Text style={styles.reasoningTitle}>🤖 Gemini Match Insights:</Text>
              {item.aiReasoning.map((bullet, idx) => (
                <Text key={idx} style={styles.reasoningBullet}>
                  • {bullet}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Action Footer with Primary Signal Teal CTA (Dark text for 4.5:1 contrast) */}
      <View style={styles.footerRow}>
        <Button
          title={item.type === 'candidate' ? 'Invite to Team' : 'Apply to Project'}
          variant="student"
          size="sm"
          onPress={() => onConnect?.(item)}
          style={styles.connectBtn}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.sm + 2,
    marginRight: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.captionBold,
    color: colors.student,
    marginTop: 1,
  },
  collegeText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scoreBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  scoreNumber: {
    ...typography.captionBold,
    fontSize: 14,
    fontWeight: '800',
  },
  scoreLabel: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  description: {
    ...typography.body,
    color: colors.textBody,
    marginVertical: spacing.xs,
    lineHeight: 20,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  breakdownToggle: {
    paddingVertical: spacing.xs,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    marginTop: spacing.xs,
  },
  breakdownToggleText: {
    ...typography.captionBold,
    color: colors.student,
  },
  breakdownContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  breakdownTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  factorItem: {
    marginBottom: spacing.xs,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  factorName: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  factorScore: {
    ...typography.captionBold,
    color: colors.textPrimary,
    fontSize: 11,
  },
  meterBg: {
    height: 4,
    backgroundColor: colors.surfaceBorder,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  reasoningBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  reasoningTitle: {
    ...typography.captionBold,
    color: colors.student,
    marginBottom: 2,
  },
  reasoningBullet: {
    ...typography.caption,
    color: colors.textBody,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  connectBtn: {
    minWidth: 130,
  },
});

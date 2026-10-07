import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Check, AlertTriangle, Zap } from 'lucide-react-native';
import { colors, typography } from '../../theme';

interface ScoreBreakdownProps {
  totalScore: number;
  skillCoverage: number;
  complementary: number;
  experience: number;
  coveredSkills: string[];
  gapFilled: string;
  missingSkills: string[];
  aiNote?: string | null;
}

const ProgressBar = ({ label, percentage }: { label: string, percentage: number }) => {
  const filledCount = Math.round((percentage / 100) * 10);
  
  return (
    <View style={styles.barRow}>
      <Text style={[typography.micro, styles.barLabel]}>{label}</Text>
      <View style={styles.segments}>
        {Array.from({ length: 10 }).map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.segment,
              i < filledCount ? styles.segmentFilled : styles.segmentEmpty
            ]}
          />
        ))}
      </View>
      <Text style={[typography.micro, styles.percentage]}>{percentage}%</Text>
    </View>
  );
};

export const ScoreBreakdown = (props: ScoreBreakdownProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable onPress={() => setExpanded(!expanded)} style={styles.container}>
      <Text style={[typography.micro, styles.matchLabel]}>
        {'// MATCH  '}{props.totalScore}%
      </Text>
      
      {expanded && (
        <View style={styles.expandedContent}>
          <ProgressBar label="SKILL COVERAGE" percentage={props.skillCoverage} />
          <ProgressBar label="COMPLEMENTARY" percentage={props.complementary} />
          <ProgressBar label="EXPERIENCE" percentage={props.experience} />
          
          <View style={styles.details}>
            {props.coveredSkills.length > 0 && (
              <View style={styles.detailRow}>
                <Check size={14} color={colors.ok} style={styles.icon} />
                <Text style={styles.detailText}>Covers {props.coveredSkills.join(', ')}</Text>
              </View>
            )}
            
            {props.gapFilled && (
              <View style={styles.detailRow}>
                <Zap size={14} color={colors.accent} style={styles.icon} />
                <Text style={styles.detailText}>Fills your gap: {props.gapFilled}</Text>
              </View>
            )}
            
            {props.missingSkills.length > 0 && (
              <View style={styles.detailRow}>
                <AlertTriangle size={14} color={colors.warn} style={styles.icon} />
                <Text style={styles.detailText}>Missing: {props.missingSkills.join(', ')}</Text>
              </View>
            )}
          </View>
          
          {props.aiNote && (
            <Text style={styles.aiNote}>
              {'// AI NOTE  '}{props.aiNote}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  matchLabel: {
    color: colors.accent,
  },
  expandedContent: {
    marginTop: 16,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barLabel: {
    width: 110,
    color: colors.textMuted,
  },
  segments: {
    flex: 1,
    flexDirection: 'row',
    gap: 2,
    marginRight: 12,
  },
  segment: {
    flex: 1,
    height: 8,
  },
  segmentFilled: {
    backgroundColor: colors.accent,
  },
  segmentEmpty: {
    backgroundColor: colors.surface2,
  },
  percentage: {
    width: 32,
    textAlign: 'right',
    color: colors.text,
  },
  details: {
    marginTop: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 8,
  },
  detailText: {
    ...typography.body,
    color: colors.text,
  },
  aiNote: {
    ...typography.micro,
    color: colors.textMuted,
    lineHeight: 16,
  },
});

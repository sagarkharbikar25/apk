import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

interface SkillBadgeProps {
  name: string;
  level: number; // 1 to 4
}

export const SkillBadge = ({ name, level }: SkillBadgeProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.pips}>
        {[1, 2, 3, 4].map((pip) => (
          <View 
            key={pip} 
            style={[
              styles.pip, 
              pip <= level ? styles.pipActive : styles.pipInactive
            ]} 
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  name: {
    ...typography.label,
    color: colors.text,
    marginRight: 12,
  },
  pips: {
    flexDirection: 'row',
    gap: 4,
  },
  pip: {
    width: 6,
    height: 6,
  },
  pipActive: {
    backgroundColor: colors.accent,
  },
  pipInactive: {
    backgroundColor: colors.surface2,
  },
});

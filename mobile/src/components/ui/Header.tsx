import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Brand } from './Brand';
import { colors } from '../../theme';

export const Header = () => {
  const navigation = useNavigation<any>();
  // Mock unread for now
  const hasUnread = true;

  return (
    <View style={styles.container}>
      <Brand size="small" />
      <Pressable onPress={() => navigation.navigate('Alerts')} style={styles.bell}>
        <Bell color={colors.text} size={24} strokeWidth={1.5} />
        {hasUnread && <View style={styles.dot} />}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.surface,
  },
  bell: {
    position: 'relative',
    padding: 4,
  },
  dot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    backgroundColor: colors.accent,
  },
});

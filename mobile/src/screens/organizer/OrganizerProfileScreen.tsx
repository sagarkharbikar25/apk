import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen, Header, GhostWord, Headline, Button } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';

export const OrganizerProfileScreen: React.FC = () => {
  const logout = useAuthStore(s => s.logout);

  return (
    <Screen withRain="static" style={styles.container}>
      <GhostWord word="PROFILE" />
      <Header />
      <View style={styles.content}>
        <Headline accent="PROFILE">ORGANIZER</Headline>
        <Button label="LOGOUT" onPress={logout} style={{ marginTop: 40 }} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
});

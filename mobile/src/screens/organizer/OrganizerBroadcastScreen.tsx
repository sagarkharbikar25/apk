import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen, Header, GhostWord, Headline } from '../../components/ui';

export const OrganizerBroadcastScreen: React.FC = () => {
  return (
    <Screen withRain="static" style={styles.container}>
      <GhostWord word="ALERTS" />
      <Header />
      <View style={styles.content}>
        <Headline accent="BROADCAST">ORGANIZER</Headline>
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

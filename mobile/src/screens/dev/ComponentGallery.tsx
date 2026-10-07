import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Camera, Zap } from 'lucide-react-native';
import { 
  Screen, 
  Brand, 
  GhostWord, 
  Headline, 
  Eyebrow, 
  SectionLabel, 
  Button, 
  Card, 
  IconBox, 
  Divider, 
  Input, 
  SkillBadge, 
  StatusPill, 
  ScoreBreakdown, 
  Skeleton, 
  EmptyState, 
  ErrorState, 
  Toast, 
  Avatar 
} from '../../components/ui';
import { colors, typography } from '../../theme';
import { OfflineBanner } from '../../components/offline/OfflineBanner';

export const ComponentGallery = () => {
  const [showToast, setShowToast] = useState(false);

  return (
    <Screen withRain="static" style={styles.container}>
      <GhostWord word="GALLERY" />
      <Toast visible={showToast} message="// SYNC COMPLETE" onHide={() => setShowToast(false)} />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <Eyebrow label="SKILLSYNC · UI GALLERY" style={styles.mb} />
        
        <Headline accent="SYSTEM" style={styles.mb}>DESIGN</Headline>
        
        <SectionLabel label="BRAND & AVATAR" />
        <View style={styles.row}>
          <Brand size="large" />
          <Brand size="medium" />
        </View>
        <View style={styles.row}>
          <Avatar name="Sagar" size={48} />
          <Avatar name="Agent" size={64} />
          <IconBox icon={Camera} />
        </View>
        
        <Divider />
        
        <SectionLabel label="BUTTONS" />
        <View style={styles.gap}>
          <Button label="PRIMARY ACTION" variant="primary" icon={Zap} />
          <Button label="OUTLINE BUTTON" variant="outline" />
          <Button label="GHOST BUTTON" variant="ghost" onPress={() => setShowToast(true)} />
          <Button label="DISABLED" disabled />
        </View>
        
        <Divider />
        
        <SectionLabel label="FORMS & BADGES" />
        <View style={styles.gap}>
          <Input label="EMAIL ADDRESS" placeholder="user@example.com" />
          <Input label="PASSWORD" error="Invalid credentials" secureTextEntry />
        </View>
        <View style={styles.row}>
          <SkillBadge name="React Native" level={4} />
          <SkillBadge name="Docker" level={2} />
        </View>
        <View style={styles.row}>
          <StatusPill status="OPEN" />
          <StatusPill status="CLOSED" />
          <StatusPill status="FULL" />
        </View>
        
        <Divider />
        
        <SectionLabel label="DATA DISPLAY" />
        <View style={styles.gap}>
          <Card bracket>
            <Text style={[typography.title, { color: colors.text, marginBottom: 8 }]}>CARD WITH BRACKET</Text>
            <Text style={[typography.body, { color: colors.textDim }]}>Uses CornerFrame overlay</Text>
          </Card>
          
          <ScoreBreakdown 
            totalScore={82}
            skillCoverage={80}
            complementary={70}
            experience={60}
            coveredSkills={['React Native', 'Node.js']}
            gapFilled="Docker"
            missingSkills={['Redis']}
            aiNote="Strong backend profile that matches the core of your stack."
          />
          
          <View style={styles.row}>
            <Skeleton width={48} height={48} />
            <View style={styles.gap}>
              <Skeleton width={200} height={20} />
              <Skeleton width={140} height={16} />
            </View>
          </View>
        </View>
        
        <Divider />
        
        <SectionLabel label="STATES" />
        <View style={styles.gap}>
          <OfflineBanner />
          <ErrorState message="Could not fetch hackathons." onRetry={() => {}} />
          <EmptyState icon={Zap} label="NO SQUADS YET" actionLabel="CREATE SQUAD" onAction={() => {}} />
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingTop: 32,
  },
  mb: {
    marginBottom: 24,
  },
  gap: {
    gap: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
});

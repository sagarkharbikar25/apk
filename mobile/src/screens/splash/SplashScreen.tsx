import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Brand, Headline, Screen, SectionLabel } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [showWaking, setShowWaking] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const initAuth = useAuthStore(s => s.initAuth);

  useEffect(() => {
    let isMounted = true;
    
    // Boot sequence
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    const wakingTimer = setTimeout(() => {
      if (isMounted) setShowWaking(true);
    }, 3000);

    // Initialize auth store (loads keychain)
    initAuth().then(() => {
      // Simulate minimum splash time for effect
      setTimeout(() => {
        if (isMounted && onFinish) {
          onFinish();
        }
      }, 4000);
    });

    return () => {
      isMounted = false;
      clearTimeout(wakingTimer);
    };
  }, [fadeAnim, initAuth, onFinish]);

  return (
    <Screen withRain="animated" style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Brand size="large" style={styles.brand} />
        
        <Headline accent="SYNC." style={styles.tagline}>
          FIND.
        </Headline>
        <Headline>SHIP.</Headline>

        {showWaking && (
          <View style={styles.footer}>
            <SectionLabel label="WAKING SERVER..." />
          </View>
        )}
      </Animated.View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    marginBottom: 48,
  },
  tagline: {
    marginBottom: -8,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
  }
});

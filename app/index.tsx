import { router } from 'expo-router';
import { Baby } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { FONT, PALETTES } from '@/lib/theme';

const SPLASH_MS = 1800;

export default function SplashScreen() {
  const { onboarded } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(onboarded ? '/(tabs)' : '/onboarding');
    }, SPLASH_MS);
    return () => clearTimeout(timer);
  }, [onboarded]);

  const palette = PALETTES.neutral;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <View style={styles.center}>
        <Animated.View entering={FadeInDown.duration(700)} style={[styles.logo, { backgroundColor: palette.strong }]}>
          <Baby size={56} color="#FFFFFF" />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(150).duration(700)} style={[styles.brand, { color: palette.ink }]}>
          Baby Bliss
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(300).duration(700)} style={[styles.tagline, { color: palette.muted }]}>
          Everything for your little one, in one place
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 32 },
  logo: {
    width: 112,
    height: 112,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brand: { fontFamily: FONT.bold, fontSize: 34 },
  tagline: { fontFamily: FONT.regular, fontSize: 16, textAlign: 'center', lineHeight: 24 },
});

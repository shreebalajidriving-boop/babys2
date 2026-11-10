import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FONT, PALETTES, type Palette } from '@/lib/theme';

export function StartupScreen({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const palette = PALETTES.neutral;
  return (
    <View style={[styles.center, { backgroundColor: palette.background }]}>
      <Text style={[styles.message, { color: palette.ink }]}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: palette.strong }]}
        >
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function SaveFailedBanner({ theme }: { theme: Palette }) {
  return (
    <View
      accessibilityRole="alert"
      style={[styles.banner, { backgroundColor: theme.card, borderColor: theme.error }]}
    >
      <Text style={[styles.bannerText, { color: theme.ink }]}>
        Your latest changes could not be saved. Check your connection.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24 },
  message: { fontFamily: FONT.semibold, fontSize: 16, textAlign: 'center', lineHeight: 24 },
  button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  buttonText: { fontFamily: FONT.bold, fontSize: 15, color: '#FFFFFF' },
  banner: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    zIndex: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  bannerText: { fontFamily: FONT.semibold, fontSize: 13, textAlign: 'center' },
});

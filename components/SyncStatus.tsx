import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONT, PALETTES, RADIUS, SPACE, type Palette } from '@/lib/theme';

export function StartupScreen({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const palette = PALETTES.neutral;
  return (
    <View style={[styles.center, { backgroundColor: palette.background }]}>
      <View style={[styles.loaderDot, { backgroundColor: palette.strong }]} />
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

export function SaveFailedBanner({ theme, onDismiss }: { theme: Palette; onDismiss?: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.banner,
        {
          top: Math.max(insets.top, 8) + 52,
          backgroundColor: theme.card,
          borderColor: theme.warning,
        },
      ]}
    >
      <Text style={[styles.bannerText, { color: theme.ink }]}>
        Saved on this device. Cloud sync is unavailable right now.
      </Text>
      {onDismiss ? (
        <Pressable onPress={onDismiss} hitSlop={10} accessibilityRole="button">
          <Text style={[styles.dismiss, { color: theme.strong }]}>Dismiss</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACE.lg, padding: SPACE.xl },
  loaderDot: { width: 10, height: 10, borderRadius: 5, marginBottom: SPACE.sm },
  message: { fontFamily: FONT.semibold, fontSize: 16, textAlign: 'center', lineHeight: 24 },
  button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: RADIUS.pill },
  buttonText: { fontFamily: FONT.bold, fontSize: 15, color: '#FFFFFF' },
  banner: {
    position: 'absolute',
    left: SPACE.lg,
    right: SPACE.lg,
    zIndex: 20,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
    shadowColor: '#1E2433',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  bannerText: { flex: 1, fontFamily: FONT.semibold, fontSize: 12, lineHeight: 17 },
  dismiss: { fontFamily: FONT.bold, fontSize: 12 },
});

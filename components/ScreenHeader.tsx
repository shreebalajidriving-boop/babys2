import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/lib/AppContext';
import { FONT, RADIUS, SPACE } from '@/lib/theme';

export function ScreenHeader({
  title,
  right,
  onBack,
}: {
  title: string;
  right?: ReactNode;
  onBack?: () => void;
}) {
  const { theme } = useApp();
  const goBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <Pressable
        onPress={goBack}
        accessibilityLabel="Go back"
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.card, borderColor: theme.border },
          pressed && styles.pressed,
        ]}
      >
        <ArrowLeft size={20} color={theme.ink} />
      </Pressable>
      <Text style={[styles.title, { color: theme.ink }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACE.pageX,
    paddingTop: SPACE.sm,
    paddingBottom: SPACE.md,
    gap: SPACE.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  button: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pressed: { opacity: 0.7 },
  title: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 18,
    letterSpacing: -0.2,
  },
  right: { minWidth: 42, alignItems: 'flex-end' },
});

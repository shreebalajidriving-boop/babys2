import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/lib/AppContext';
import { FONT } from '@/lib/theme';

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
    <View style={styles.row}>
      <Pressable
        onPress={goBack}
        accessibilityLabel="Go back"
        style={({ pressed }) => [styles.button, { backgroundColor: theme.card }, pressed && styles.pressed]}
      >
        <ArrowLeft size={22} color={theme.ink} />
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
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 12,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pressed: { opacity: 0.7 },
  title: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  right: { minWidth: 44, alignItems: 'flex-end' },
});

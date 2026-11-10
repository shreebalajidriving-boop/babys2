import { Check } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/lib/AppContext';
import { FONT, PALETTES, type Palette } from '@/lib/theme';
import type { ThemeOverride } from '@/lib/types';

const OPTIONS: { value: ThemeOverride; label: string; detail: string }[] = [
  { value: null, label: 'Match my child', detail: 'Follows the selected child\'s gender' },
  { value: 'blue', label: 'Soft Baby Blue', detail: 'Calm blue tones' },
  { value: 'pink', label: 'Baby Pink', detail: 'Warm pink tones' },
  { value: 'neutral', label: 'Neutral Sage', detail: 'Gender-neutral green tones' },
];

export function ThemePicker({
  value,
  onChange,
}: {
  value: ThemeOverride;
  onChange: (value: ThemeOverride) => void;
}) {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.list}>
      {OPTIONS.map((option) => {
        const active = option.value === value;
        const swatch = option.value ? PALETTES[option.value] : theme;
        return (
          <Pressable
            key={option.label}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.card,
              active && { borderColor: theme.strong, borderWidth: 2 },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.swatches}>
              <View style={[styles.swatch, { backgroundColor: swatch.primary }]} />
              <View style={[styles.swatch, { backgroundColor: swatch.background }]} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.label}>{option.label}</Text>
              <Text style={styles.detail}>{option.detail}</Text>
            </View>
            {active ? (
              <View style={[styles.check, { backgroundColor: theme.strong }]}>
                <Check size={14} color="#FFFFFF" />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    list: { gap: 10 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
    },
    pressed: { opacity: 0.85 },
    swatches: { flexDirection: 'row', gap: 4 },
    swatch: { width: 22, height: 40, borderRadius: 8, borderWidth: 1, borderColor: t.border },
    copy: { flex: 1, gap: 2 },
    label: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    detail: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    check: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  });
}

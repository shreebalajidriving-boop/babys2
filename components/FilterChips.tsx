import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useApp } from '@/lib/AppContext';
import { FONT } from '@/lib/theme';

type Option<T extends string> = { value: T; label: string };

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { theme } = useApp();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.chip,
              { borderColor: active ? theme.strong : theme.border, backgroundColor: active ? theme.strong : theme.card },
            ]}
          >
            <Text style={[styles.label, { color: active ? '#FFFFFF' : theme.ink }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingRight: 20 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  label: { fontFamily: FONT.semibold, fontSize: 14 },
});

import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/lib/AppContext';
import { FONT, PALETTES, resolveThemeKey, type Palette } from '@/lib/theme';
import type { Child } from '@/lib/types';

export function ChildSwitcher() {
  const { children, activeChildId, setActiveChild, theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {children.map((child) => (
        <ChildChip
          key={child.id}
          child={child}
          active={child.id === activeChildId}
          onPress={() => setActiveChild(child.id)}
        />
      ))}
      <Pressable onPress={() => router.push('/child/new')} style={({ pressed }) => [styles.addChip, pressed && styles.pressed]}>
        <Plus size={16} color={theme.strong} />
        <Text style={styles.addText}>Add child</Text>
      </Pressable>
    </ScrollView>
  );
}

function ChildChip({ child, active, onPress }: { child: Child; active: boolean; onPress: () => void }) {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const tone = PALETTES[resolveThemeKey(child.gender, null)];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.chip,
        active && { backgroundColor: theme.strong, borderColor: theme.strong },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: tone.primary }]}>
        <Text style={styles.avatarText}>{child.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View>
        <Text style={[styles.name, active && { color: '#FFFFFF' }]}>{child.name}</Text>
        <Text style={[styles.age, active && { color: '#FFFFFF' }]}>{child.ageGroup}</Text>
      </View>
    </Pressable>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    row: { gap: 10, paddingVertical: 4 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 8,
      paddingLeft: 8,
      paddingRight: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
    },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    name: { fontFamily: FONT.bold, fontSize: 14, color: t.ink },
    age: { fontFamily: FONT.regular, fontSize: 11, color: t.muted },
    addChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: t.strong,
      minHeight: 52,
    },
    addText: { fontFamily: FONT.bold, fontSize: 14, color: t.strong },
    pressed: { opacity: 0.8 },
  });
}

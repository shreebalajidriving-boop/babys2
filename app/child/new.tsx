import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { useToast } from '@/components/Toast';
import { ChildForm } from '@/components/ChildForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FONT, type Palette } from '@/lib/theme';

export default function AddChildScreen() {
  const { theme, addChild } = useApp();
  const toast = useToast();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Add child" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>Add another child to switch between their products, appointments and learning.</Text>
        <ChildForm
          submitLabel="Save child"
          onSubmit={(child) => {
            addChild(child);
            toast(`${child.name} has been added`);
            router.back();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32, gap: 20 },
    subtitle: { fontFamily: FONT.regular, fontSize: 15, color: t.muted, lineHeight: 22 },
  });
}

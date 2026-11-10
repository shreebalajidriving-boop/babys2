import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { FONT, PALETTES, resolveThemeKey, type Palette } from '@/lib/theme';
import { ChildForm } from '@/components/ChildForm';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemePicker } from '@/components/ThemePicker';
import type { Child, ThemeOverride } from '@/lib/types';

type Step = 'parent' | 'child' | 'theme';
const STEPS: Step[] = ['parent', 'child', 'theme'];
type ChildInput = Omit<Child, 'id'>;

export default function SetupScreen() {
  const { theme, parent, completeOnboarding, setThemeOverride } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [step, setStep] = useState<Step>('parent');
  const [parentName, setParentName] = useState(parent?.name ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [child, setChild] = useState<ChildInput | null>(null);
  const [override, setOverride] = useState<ThemeOverride>(null);

  const previewPalette = PALETTES[resolveThemeKey(child?.gender, override)];

  const goBack = () => {
    if (step === 'parent') router.back();
    else setStep(STEPS[STEPS.indexOf(step) - 1]);
  };

  const continueFromParent = () => {
    if (!parentName.trim()) {
      setNameError('Please tell us your name.');
      return;
    }
    setNameError(null);
    setStep('child');
  };

  const finish = () => {
    if (!child) return;
    setThemeOverride(override);
    completeOnboarding(parentName.trim(), child);
    router.replace('/(tabs)');
  };

  const headings: Record<Step, { title: string; subtitle: string }> = {
    parent: { title: 'Welcome! What should we call you?', subtitle: 'Your name appears on your profile and in greetings.' },
    child: { title: 'Tell us about your child', subtitle: 'This helps us show age-appropriate products and learning.' },
    theme: { title: 'Your Baby Bliss theme', subtitle: 'We picked a theme for your child. Change it any time from your profile.' },
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Set up profile" onBack={goBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.progress}>
          {STEPS.map((s, i) => (
            <View key={s} style={[styles.progressBar, i <= STEPS.indexOf(step) && styles.progressActive]} />
          ))}
        </View>

        <View style={styles.heading}>
          <Text style={styles.title}>{headings[step].title}</Text>
          <Text style={styles.subtitle}>{headings[step].subtitle}</Text>
        </View>

        {step === 'parent' ? (
          <View style={styles.field}>
            <Text style={styles.label}>Your name</Text>
            <TextInput
              value={parentName}
              onChangeText={setParentName}
              placeholder="e.g. Priya"
              placeholderTextColor={theme.muted}
              style={styles.input}
              maxLength={40}
              autoFocus
            />
            {nameError ? <Text style={styles.error}>{nameError}</Text> : null}
            <PrimaryButton label="Continue" onPress={continueFromParent} />
          </View>
        ) : null}

        {step === 'child' ? (
          <ChildForm
            submitLabel="Continue"
            onSubmit={(value) => {
              setChild(value);
              setStep('theme');
            }}
          />
        ) : null}

        {step === 'theme' && child ? (
          <View style={styles.themeStep}>
            <View style={[styles.preview, { backgroundColor: previewPalette.secondary }]}>
              <Text style={styles.previewName}>{child.name}'s space</Text>
              <View style={styles.previewRow}>
                <View style={[styles.previewChip, { backgroundColor: previewPalette.strong }]}>
                  <Text style={styles.previewChipText}>Shop</Text>
                </View>
                <View style={[styles.previewChip, { backgroundColor: previewPalette.card }]}>
                  <Text style={[styles.previewChipText, { color: previewPalette.ink }]}>Learn</Text>
                </View>
              </View>
            </View>
            <ThemePicker value={override} onChange={setOverride} />
            <PrimaryButton label="Start using Baby Bliss" onPress={finish} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32, gap: 24 },
    progress: { flexDirection: 'row', gap: 8 },
    progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: t.border },
    progressActive: { backgroundColor: t.strong },
    heading: { gap: 8 },
    title: { fontFamily: FONT.bold, fontSize: 26, color: t.ink, lineHeight: 32 },
    subtitle: { fontFamily: FONT.regular, fontSize: 15, color: t.muted, lineHeight: 22 },
    field: { gap: 16 },
    label: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    input: {
      minHeight: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
      paddingHorizontal: 16,
      fontFamily: FONT.regular,
      fontSize: 16,
      color: t.ink,
    },
    error: { fontFamily: FONT.semibold, fontSize: 13, color: t.error },
    themeStep: { gap: 24 },
    preview: { borderRadius: 20, padding: 20, gap: 14 },
    previewName: { fontFamily: FONT.bold, fontSize: 20, color: t.ink },
    previewRow: { flexDirection: 'row', gap: 10 },
    previewChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    previewChipText: { fontFamily: FONT.bold, fontSize: 14, color: '#FFFFFF' },
  });
}

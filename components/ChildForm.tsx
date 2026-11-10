import { Check } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '@/lib/AppContext';
import { FONT, type Palette } from '@/lib/theme';
import { PrimaryButton } from '@/components/PrimaryButton';
import type { Child, Gender } from '@/lib/types';

export const AGE_GROUPS = ['0-6 months', '6-12 months', '1-2 years', '2-4 years', '4-7 years'];

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Boy' },
  { value: 'female', label: 'Girl' },
  { value: 'other', label: 'Prefer not to say' },
];

type ChildInput = Omit<Child, 'id'>;

export function ChildForm({
  submitLabel,
  onSubmit,
  initial,
}: {
  submitLabel: string;
  onSubmit: (child: ChildInput) => void;
  initial?: ChildInput;
}) {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [name, setName] = useState(initial?.name ?? '');
  const [gender, setGender] = useState<Gender | null>(initial?.gender ?? null);
  const [ageGroup, setAgeGroup] = useState<string | null>(initial?.ageGroup ?? null);
  const [errors, setErrors] = useState<{ name?: string; gender?: string; age?: string }>({});

  const submit = () => {
    const nextErrors = {
      name: name.trim() ? undefined : 'Please enter your child\'s name.',
      gender: gender ? undefined : 'Select one option to personalise the theme.',
      age: ageGroup ? undefined : 'Choose an age group.',
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.gender || nextErrors.age || !gender || !ageGroup) return;
    onSubmit({ name: name.trim(), gender, ageGroup });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.field}>
        <Text style={styles.label}>Child's first name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Aarav"
          placeholderTextColor={theme.muted}
          style={styles.input}
          maxLength={24}
        />
        {errors.name ? <Text style={styles.error}>{errors.name}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Child's gender</Text>
        <View style={styles.segmented}>
          {GENDERS.map((option) => {
            const active = gender === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setGender(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.segment, active && styles.segmentActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.hint}>Gender only sets the colour theme. Everything stays available.</Text>
        {errors.gender ? <Text style={styles.error}>{errors.gender}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Age group</Text>
        <View style={styles.chips}>
          {AGE_GROUPS.map((group) => {
            const active = ageGroup === group;
            return (
              <Pressable
                key={group}
                onPress={() => setAgeGroup(group)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.chip, active && styles.chipActive]}
              >
                {active ? <Check size={14} color={theme.strong} /> : null}
                <Text style={[styles.chipText, active && { color: theme.strong }]}>{group}</Text>
              </Pressable>
            );
          })}
        </View>
        {errors.age ? <Text style={styles.error}>{errors.age}</Text> : null}
      </View>

      <PrimaryButton label={submitLabel} onPress={submit} />
    </View>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    wrap: { gap: 24 },
    field: { gap: 8 },
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
    hint: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    error: { fontFamily: FONT.semibold, fontSize: 13, color: t.error },
    segmented: {
      flexDirection: 'row',
      backgroundColor: t.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      padding: 4,
      gap: 4,
    },
    segment: {
      flex: 1,
      minHeight: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    segmentActive: { backgroundColor: t.strong },
    segmentText: { fontFamily: FONT.semibold, fontSize: 14, color: t.ink, textAlign: 'center' },
    segmentTextActive: { color: '#FFFFFF' },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      minHeight: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
    },
    chipActive: { borderColor: t.strong, backgroundColor: t.secondary },
    chipText: { fontFamily: FONT.semibold, fontSize: 14, color: t.ink },
  });
}

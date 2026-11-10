import { router } from 'expo-router';
import { Check, Circle, Clock } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { formatIsoDate, toIsoDate } from '@/lib/schedule';
import { FONT, type Palette } from '@/lib/theme';
import {
  ageLabel,
  dueDateFor,
  parseBirthDate,
  VACCINE_DISCLAIMER,
  VACCINES,
  vaccineStatus,
  type Vaccine,
  type VaccineStatus,
} from '@/lib/vaccines';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useToast } from '@/components/Toast';

type Row = { vaccine: Vaccine; dueIso: string; status: VaccineStatus };

export default function VaccinesScreen() {
  const { theme, children, activeChild, vaccinesGiven, setActiveChild, setChildBirthDate, toggleVaccineGiven } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const showToast = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(activeChild?.id ?? null);
  const selected = children.find((c) => c.id === selectedId) ?? children[0] ?? null;
  const todayIso = toIsoDate(new Date());

  const rows = useMemo<Row[]>(() => {
    if (!selected?.birthDate) return [];
    const givenSet = new Set(vaccinesGiven);
    return VACCINES.map((vaccine) => {
      const dueIso = dueDateFor(selected.birthDate as string, vaccine);
      const given = givenSet.has(`${selected.id}|${vaccine.id}`);
      return { vaccine, dueIso, status: vaccineStatus(given, dueIso, todayIso) };
    });
  }, [selected, vaccinesGiven, todayIso]);

  if (children.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Vaccinations" />
        <View style={styles.centered}>
          <EmptyState
            title="Add a child first"
            message="The vaccine schedule is built from your child's date of birth."
            actionLabel="Add child"
            onAction={() => router.navigate('/child/new')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const givenCount = rows.filter((r) => r.status === 'done').length;
  const dueRows = rows.filter((r) => r.status === 'due');
  const upcomingRows = rows.filter((r) => r.status === 'upcoming');
  const doneRows = rows.filter((r) => r.status === 'done');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Vaccinations" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children.length > 1 ? (
          <View style={styles.chips}>
            {children.map((child) => {
              const active = child.id === selected?.id;
              return (
                <Pressable
                  key={child.id}
                  onPress={() => {
                    setSelectedId(child.id);
                    setActiveChild(child.id);
                  }}
                  style={[styles.chip, active && styles.chipActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{child.name}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {selected && !selected.birthDate ? (
          <BirthDateForm
            key={selected.id}
            childName={selected.name}
            todayIso={todayIso}
            styles={styles}
            theme={theme}
            onSave={(iso) => {
              setChildBirthDate(selected.id, iso);
              showToast(`Schedule ready for ${selected.name}`);
            }}
          />
        ) : null}

        {selected?.birthDate ? (
          <>
            <View style={styles.summary}>
              <Text style={styles.summaryName}>{selected.name}</Text>
              <Text style={styles.summaryMeta}>
                {ageLabel(selected.birthDate, todayIso)}  |  Born {formatIsoDate(selected.birthDate)}
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round((givenCount / rows.length) * 100)}%` }]} />
              </View>
              <Text style={styles.summaryMeta}>
                {givenCount} of {rows.length} given
              </Text>
              <Pressable
                onPress={() => {
                  setChildBirthDate(selected.id, undefined);
                }}
                accessibilityRole="button"
                style={styles.editLink}
              >
                <Text style={styles.editText}>Change date of birth</Text>
              </Pressable>
            </View>

            <VaccineSection title="Due now" rows={dueRows} emptyText="Nothing is due right now." childId={selected.id} styles={styles} theme={theme} onToggle={toggleVaccineGiven} toast={showToast} />
            <VaccineSection title="Coming up" rows={upcomingRows} emptyText="No upcoming vaccines." childId={selected.id} styles={styles} theme={theme} onToggle={toggleVaccineGiven} toast={showToast} />
            <VaccineSection title="Given" rows={doneRows} emptyText="No vaccines marked as given yet." childId={selected.id} styles={styles} theme={theme} onToggle={toggleVaccineGiven} toast={showToast} />

            <Text style={styles.disclaimer}>{VACCINE_DISCLAIMER}</Text>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function BirthDateForm({
  childName,
  todayIso,
  styles,
  theme,
  onSave,
}: {
  childName: string;
  todayIso: string;
  styles: ReturnType<typeof makeStyles>;
  theme: Palette;
  onSave: (iso: string) => void;
}) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const result = parseBirthDate(input, todayIso);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    setError(null);
    onSave(result.iso);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>When was {childName} born?</Text>
      <Text style={styles.cardBody}>
        Enter the date of birth to see the routine vaccines and when each one is due.
      </Text>
      <TextInput
        value={input}
        onChangeText={(text) => {
          setInput(text);
          if (error) setError(null);
        }}
        placeholder="DD/MM/YYYY"
        placeholderTextColor={theme.muted}
        keyboardType="numbers-and-punctuation"
        style={[styles.input, error ? styles.inputError : null]}
        accessibilityLabel="Date of birth"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <PrimaryButton label="Save date of birth" onPress={save} />
    </View>
  );
}

function VaccineSection({
  title,
  rows,
  emptyText,
  childId,
  styles,
  theme,
  onToggle,
  toast,
}: {
  title: string;
  rows: Row[];
  emptyText: string;
  childId: string;
  styles: ReturnType<typeof makeStyles>;
  theme: Palette;
  onToggle: (childId: string, vaccineId: string) => void;
  toast: (message: string) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {rows.length === 0 ? (
        <Text style={styles.emptyText}>{emptyText}</Text>
      ) : (
        rows.map(({ vaccine, dueIso, status }) => {
          const given = status === 'done';
          const Icon = given ? Check : status === 'due' ? Clock : Circle;
          const iconColor = given ? theme.strong : status === 'due' ? theme.ink : theme.muted;
          return (
            <Pressable
              key={vaccine.id}
              onPress={() => {
                onToggle(childId, vaccine.id);
                toast(given ? `${vaccine.name} marked as not given` : `${vaccine.name} marked as given`);
              }}
              style={[styles.row, given && styles.rowDone]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: given }}
            >
              <View style={[styles.rowIcon, given && { backgroundColor: theme.secondary }]}>
                <Icon size={18} color={iconColor} strokeWidth={2} />
              </View>
              <View style={styles.rowCopy}>
                <Text style={[styles.rowName, given && styles.rowNameDone]}>{vaccine.name}</Text>
                <Text style={styles.rowMeta}>{vaccine.protects}</Text>
                <Text style={styles.rowDue}>
                  {vaccine.dueLabel}  |  {given ? 'Given' : `Due ${formatIsoDate(dueIso)}`}
                </Text>
              </View>
            </Pressable>
          );
        })
      )}
    </View>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    centered: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
    content: { paddingHorizontal: 20, paddingBottom: 32, gap: 20 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
    },
    chipActive: { backgroundColor: t.strong, borderColor: t.strong },
    chipText: { fontFamily: FONT.semibold, fontSize: 13, color: t.ink },
    chipTextActive: { color: t.card },
    card: {
      padding: 20,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      gap: 12,
    },
    cardTitle: { fontFamily: FONT.bold, fontSize: 18, color: t.ink },
    cardBody: { fontFamily: FONT.regular, fontSize: 14, color: t.muted, lineHeight: 21 },
    input: {
      fontFamily: FONT.semibold,
      fontSize: 16,
      color: t.ink,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.background,
    },
    inputError: { borderColor: '#C53030' },
    errorText: { fontFamily: FONT.semibold, fontSize: 13, color: '#C53030' },
    summary: {
      padding: 20,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      gap: 8,
    },
    summaryName: { fontFamily: FONT.bold, fontSize: 20, color: t.ink },
    summaryMeta: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    progressTrack: { height: 8, borderRadius: 999, backgroundColor: t.secondary, overflow: 'hidden', marginTop: 4 },
    progressFill: { height: 8, borderRadius: 999, backgroundColor: t.strong },
    editLink: { alignSelf: 'flex-start', marginTop: 4 },
    editText: { fontFamily: FONT.semibold, fontSize: 13, color: t.strong },
    section: { gap: 12 },
    sectionTitle: { fontFamily: FONT.bold, fontSize: 18, color: t.ink },
    emptyText: { fontFamily: FONT.regular, fontSize: 14, color: t.muted },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      padding: 14,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    rowDone: { opacity: 0.85 },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.background,
    },
    rowCopy: { flex: 1, gap: 2 },
    rowName: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    rowNameDone: { color: t.muted },
    rowMeta: { fontFamily: FONT.regular, fontSize: 12, color: t.muted, lineHeight: 18 },
    rowDue: { fontFamily: FONT.semibold, fontSize: 12, color: t.strong, marginTop: 4 },
    disclaimer: { fontFamily: FONT.regular, fontSize: 12, color: t.muted, lineHeight: 18 },
  });
}

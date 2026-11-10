import { router } from 'expo-router';
import { ChevronRight, ShieldCheck, Star } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { formatINR } from '@/lib/format';
import { SITTERS, type Sitter } from '@/lib/sitters';
import { FONT, type Palette } from '@/lib/theme';
import { AGE_GROUPS } from '@/components/ChildForm';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { ScreenHeader } from '@/components/ScreenHeader';

type SortKey = 'rating' | 'rate' | 'experience';

const AGE_OPTIONS = [
  { value: 'all', label: 'All ages' },
  ...AGE_GROUPS.map((group) => ({ value: group, label: group })),
];

const CERT_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: 'cpr', label: 'CPR certified' },
];

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'rating', label: 'Top rated' },
  { value: 'rate', label: 'Rate: low to high' },
  { value: 'experience', label: 'Most experienced' },
];

export default function BabysittingListScreen() {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [age, setAge] = useState('all');
  const [cert, setCert] = useState('any');
  const [sort, setSort] = useState<SortKey>('rating');

  const sitters = useMemo(() => {
    const filtered = SITTERS.filter(
      (s) =>
        (age === 'all' || s.ageGroups.some((group) => group === age)) &&
        (cert === 'any' || s.cprCertified),
    );
    return [...filtered].sort((a, b) => {
      if (sort === 'rate') return a.hourlyRate - b.hourlyRate;
      if (sort === 'experience') return b.experience - a.experience;
      return b.rating - a.rating;
    });
  }, [age, cert, sort]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Babysitters" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Trusted, background-checked sitters for a few hours or an evening.</Text>

        <View style={styles.filters}>
          <FilterChips options={AGE_OPTIONS} value={age} onChange={setAge} />
          <FilterChips options={CERT_OPTIONS} value={cert} onChange={setCert} />
          <FilterChips options={SORTS} value={sort} onChange={setSort} />
        </View>

        {sitters.length === 0 ? (
          <EmptyState
            title="No sitters match"
            message="Try a different age group or remove the certification filter."
            actionLabel="Reset filters"
            onAction={() => {
              setAge('all');
              setCert('any');
            }}
          />
        ) : (
          <View style={styles.list}>
            {sitters.map((sitter) => (
              <SitterCard key={sitter.id} sitter={sitter} styles={styles} theme={theme} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SitterCard({ sitter, styles, theme }: { sitter: Sitter; styles: ReturnType<typeof makeStyles>; theme: Palette }) {
  return (
    <Pressable
      onPress={() => router.navigate(`/babysitting/${sitter.id}`)}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`View ${sitter.name}`}
    >
      <Image source={{ uri: sitter.image }} style={styles.avatar} />
      <View style={styles.cardCopy}>
        <Text style={styles.name}>{sitter.name}</Text>
        <Text style={styles.meta}>{sitter.experience} years experience  |  {sitter.languages.join(', ')}</Text>
        <View style={styles.badgeRow}>
          <Star size={13} color="#D69E2E" fill="#D69E2E" />
          <Text style={styles.rating}>
            {sitter.rating.toFixed(1)} ({sitter.reviews})
          </Text>
          {sitter.cprCertified ? (
            <View style={styles.cprBadge}>
              <ShieldCheck size={12} color={theme.strong} />
              <Text style={styles.cprText}>CPR</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.rate}>{formatINR(sitter.hourlyRate)} / hour</Text>
      </View>
      <ChevronRight size={18} color={theme.muted} />
    </Pressable>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingBottom: 32, gap: 20 },
    intro: { fontFamily: FONT.regular, fontSize: 14, color: t.muted, lineHeight: 21 },
    filters: { gap: 12 },
    list: { gap: 12 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    avatar: { width: 72, height: 72, borderRadius: 16, backgroundColor: t.secondary },
    cardCopy: { flex: 1, gap: 4 },
    name: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    meta: { fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    rating: { fontFamily: FONT.semibold, fontSize: 12, color: t.ink },
    cprBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: t.secondary,
    },
    cprText: { fontFamily: FONT.bold, fontSize: 11, color: t.strong },
    rate: { fontFamily: FONT.bold, fontSize: 14, color: t.ink, marginTop: 2 },
  });
}

import { router } from 'expo-router';
import { CalendarCheck, ChevronRight, FlaskConical, Sparkles, Star, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { DOCTORS, type Doctor } from '@/lib/doctors';
import { formatINR } from '@/lib/format';
import { FONT, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { SearchField } from '@/components/SearchField';

type SortKey = 'rating' | 'fee' | 'experience';

const SPECIALTIES = [
  { value: 'all', label: 'All' },
  ...Array.from(new Set(DOCTORS.map((d) => d.specialty))).map((s) => ({ value: s, label: s })),
];

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'rating', label: 'Top rated' },
  { value: 'fee', label: 'Fee: low to high' },
  { value: 'experience', label: 'Most experienced' },
];

export default function CareTab() {
  const { theme, activeChild, appointments } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [specialty, setSpecialty] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('rating');
  const [query, setQuery] = useState('');

  const doctors = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = DOCTORS.filter(
      (d) =>
        (specialty === 'all' || d.specialty === specialty) &&
        (!q ||
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.clinic.toLowerCase().includes(q)),
    );
    return [...filtered].sort((a, b) => {
      if (sort === 'fee') return a.onlineFee - b.onlineFee;
      if (sort === 'experience') return b.experience - a.experience;
      return b.rating - a.rating;
    });
  }, [specialty, sort, query]);

  const upcoming = appointments.filter((a) => a.status === 'confirmed').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.title}>Doctors</Text>
          <Text style={styles.subtitle}>
            Clinic or online consults for {activeChild?.name ?? 'your little one'}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={() => router.navigate('/lab')} style={styles.actionCard} accessibilityRole="button">
            <View style={[styles.actionIcon, { backgroundColor: theme.secondary }]}>
              <FlaskConical size={20} color={theme.strong} />
            </View>
            <Text style={styles.actionTitle}>Lab tests</Text>
            <Text style={styles.actionMeta}>Home sample collection</Text>
          </Pressable>
          <Pressable onPress={() => router.navigate('/bookings')} style={styles.actionCard} accessibilityRole="button">
            <View style={[styles.actionIcon, { backgroundColor: theme.secondary }]}>
              <CalendarCheck size={20} color={theme.strong} />
            </View>
            <Text style={styles.actionTitle}>My bookings</Text>
            <Text style={styles.actionMeta}>{upcoming} upcoming visit{upcoming === 1 ? '' : 's'}</Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={() => router.navigate('/assistant')} style={styles.actionCard} accessibilityRole="button">
            <View style={[styles.actionIcon, { backgroundColor: theme.secondary }]}>
              <Sparkles size={20} color={theme.strong} />
            </View>
            <Text style={styles.actionTitle}>Parenting help</Text>
            <Text style={styles.actionMeta}>Quick answers on common concerns</Text>
          </Pressable>
          <Pressable onPress={() => router.navigate('/community')} style={styles.actionCard} accessibilityRole="button">
            <View style={[styles.actionIcon, { backgroundColor: theme.secondary }]}>
              <Users size={20} color={theme.strong} />
            </View>
            <Text style={styles.actionTitle}>Community</Text>
            <Text style={styles.actionMeta}>Tips and questions from parents</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Find a doctor</Text>
          <SearchField value={query} onChangeText={setQuery} placeholder="Search doctor, specialty or clinic" />
          <FilterChips options={SPECIALTIES} value={specialty} onChange={setSpecialty} />
          <FilterChips options={SORTS} value={sort} onChange={setSort} />
        </View>

        {doctors.length === 0 ? (
          <EmptyState
            title="No doctors found"
            message="Try another search or specialty."
            actionLabel="Clear search"
            onAction={() => {
              setSpecialty('all');
              setQuery('');
            }}
          />
        ) : (
          <View style={styles.list}>
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} styles={styles} muted={theme.muted} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DoctorCard({ doctor, styles, muted }: { doctor: Doctor; styles: ReturnType<typeof makeStyles>; muted: string }) {
  return (
    <Pressable
      onPress={() => router.navigate(`/doctor/${doctor.id}`)}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`View ${doctor.name}`}
    >
      <Image source={{ uri: doctor.image }} style={styles.avatar} />
      <View style={styles.cardCopy}>
        <Text style={styles.doctorName}>{doctor.name}</Text>
        <Text style={styles.specialty}>{doctor.specialty}</Text>
        <Text style={styles.meta}>{doctor.experience} years  |  {doctor.clinic}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.ratingRow}>
            <Star size={13} color="#D69E2E" fill="#D69E2E" />
            <Text style={styles.rating}>{doctor.rating.toFixed(1)} ({doctor.reviews})</Text>
          </View>
          <Text style={styles.fee}>{formatINR(doctor.onlineFee)} online</Text>
        </View>
      </View>
      <ChevronRight size={18} color={muted} />
    </Pressable>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, gap: 20 },
    title: { fontFamily: FONT.bold, fontSize: 28, color: t.ink, letterSpacing: -0.4 },
    subtitle: { fontFamily: FONT.regular, fontSize: 14, color: t.muted, marginTop: 4, lineHeight: 20 },
    actions: { flexDirection: 'row', gap: 12 },
    actionCard: {
      flex: 1,
      padding: 16,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      gap: 6,
    },
    actionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    actionTitle: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    actionMeta: { fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    section: { gap: 12 },
    sectionTitle: { fontFamily: FONT.bold, fontSize: 18, color: t.ink },
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
    cardCopy: { flex: 1, gap: 2 },
    doctorName: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    specialty: { fontFamily: FONT.semibold, fontSize: 13, color: t.strong },
    meta: { fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    rating: { fontFamily: FONT.semibold, fontSize: 12, color: t.ink },
    fee: { fontFamily: FONT.bold, fontSize: 13, color: t.ink },
  });
}

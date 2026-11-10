import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { getDoctor } from '@/lib/doctors';
import { getLab, getLabTest } from '@/lib/labs';
import { formatIsoDate } from '@/lib/schedule';
import { getSitter } from '@/lib/sitters';
import { FONT, type Palette } from '@/lib/theme';
import { FilterChips } from '@/components/FilterChips';
import { ScreenHeader } from '@/components/ScreenHeader';

type Tab = 'appointments' | 'labs' | 'sitters';
const TABS: { value: Tab; label: string }[] = [
  { value: 'appointments', label: 'Doctor visits' },
  { value: 'labs', label: 'Lab tests' },
  { value: 'sitters', label: 'Babysitting' },
];

export default function BookingsScreen() {
  const { theme, appointments, labBookings, sitterBookings, children } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [tab, setTab] = useState<Tab>('appointments');

  const childName = (id: string) => children.find((c) => c.id === id)?.name ?? '';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="My bookings" />
      <View style={styles.tabs}>
        <FilterChips options={TABS} value={tab} onChange={setTab} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'appointments' ? (
          appointments.length === 0 ? (
            <Text style={styles.empty}>No doctor visits yet. Book one from the Care tab.</Text>
          ) : (
            appointments.map((a) => {
              const doctor = getDoctor(a.doctorId);
              return (
                <Pressable
                  key={a.id}
                  onPress={() => router.navigate(`/appointment/${a.id}`)}
                  style={styles.card}
                  accessibilityRole="button"
                >
                  <View style={styles.cardCopy}>
                    <Text style={styles.title}>{doctor?.name}</Text>
                    <Text style={styles.meta}>
                      {formatIsoDate(a.date)}  |  {a.time}  |  {a.mode === 'online' ? 'Online' : 'Clinic'}  |  {childName(a.childId)}
                    </Text>
                  </View>
                  <Text style={[styles.status, a.status === 'cancelled' && { color: theme.error }]}>
                    {a.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}
                  </Text>
                </Pressable>
              );
            })
          )
        ) : null}

        {tab === 'labs' ? (
          labBookings.length === 0 ? (
            <Text style={styles.empty}>No lab tests booked yet.</Text>
          ) : (
            labBookings.map((b) => (
              <Pressable key={b.id} onPress={() => router.navigate(`/lab/booking/${b.id}`)} style={styles.card} accessibilityRole="button">
                <View style={styles.cardCopy}>
                  <Text style={styles.title}>{getLabTest(b.testId)?.name}</Text>
                  <Text style={styles.meta}>
                    {formatIsoDate(b.date)}  |  {getLab(b.labId)?.name}  |  {b.slot}  |  {childName(b.childId)}
                  </Text>
                </View>
                <ChevronRight size={18} color={theme.muted} />
              </Pressable>
            ))
          )
        ) : null}

        {tab === 'sitters' ? (
          sitterBookings.length === 0 ? (
            <Text style={styles.empty}>No babysitting bookings yet. Find a sitter from the Care tab.</Text>
          ) : (
            sitterBookings.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => router.navigate(`/babysitting/booking/${b.id}`)}
                style={styles.card}
                accessibilityRole="button"
              >
                <View style={styles.cardCopy}>
                  <Text style={styles.title}>{getSitter(b.sitterId)?.name}</Text>
                  <Text style={styles.meta}>
                    {formatIsoDate(b.date)}  |  {b.startTime}  |  {b.hours} hours  |  {childName(b.childId)}
                  </Text>
                </View>
                <Text style={[styles.status, b.status === 'cancelled' && { color: theme.error }]}>
                  {b.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}
                </Text>
              </Pressable>
            ))
          )
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    tabs: { paddingHorizontal: 20, paddingBottom: 12 },
    content: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
    empty: { fontFamily: FONT.regular, fontSize: 15, color: t.muted, textAlign: 'center', marginTop: 40 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      padding: 16,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    cardCopy: { flex: 1, gap: 4 },
    title: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    meta: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    status: { fontFamily: FONT.semibold, fontSize: 12, color: t.success },
  });
}

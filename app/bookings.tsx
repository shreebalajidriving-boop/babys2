import { router, useLocalSearchParams } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { getDoctor } from '@/lib/doctors';
import { formatINR } from '@/lib/format';
import { getLab, getLabTest } from '@/lib/labs';
import { formatIsoDate } from '@/lib/schedule';
import { getSitter } from '@/lib/sitters';
import { FONT, type Palette } from '@/lib/theme';
import { VACCINES } from '@/lib/vaccines';
import { FilterChips } from '@/components/FilterChips';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';

type Tab = 'appointments' | 'labs' | 'vaccines' | 'sitters';
const TABS: { value: Tab; label: string }[] = [
  { value: 'appointments', label: 'Doctor visits' },
  { value: 'labs', label: 'Lab tests' },
  { value: 'vaccines', label: 'Vaccinations' },
  { value: 'sitters', label: 'Babysitting' },
];

function isTab(value: string | undefined): value is Tab {
  return value === 'appointments' || value === 'labs' || value === 'vaccines' || value === 'sitters';
}

export default function BookingsScreen() {
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const { theme, appointments, labBookings, sitterBookings, vaccineBookings, children } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [tab, setTab] = useState<Tab>(isTab(tabParam) ? tabParam : 'appointments');

  useEffect(() => {
    if (isTab(tabParam)) setTab(tabParam);
  }, [tabParam]);

  const childName = (id: string) => children.find((c) => c.id === id)?.name ?? '';
  const vaccines = vaccineBookings ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="My care bookings" />
      <View style={styles.tabs}>
        <FilterChips
          options={TABS}
          value={tab}
          onChange={(value) => {
            setTab(value);
            router.setParams({ tab: value });
          }}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'appointments' ? (
          appointments.length === 0 ? (
            <EmptyBlock
              text="No doctor appointments yet."
              actionLabel="Find a doctor"
              onAction={() => router.navigate('/care')}
              styles={styles}
            />
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
            <EmptyBlock
              text="No lab tests booked yet."
              actionLabel="Browse lab tests"
              onAction={() => router.navigate('/lab')}
              styles={styles}
            />
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

        {tab === 'vaccines' ? (
          vaccines.length === 0 ? (
            <EmptyBlock
              text="No vaccination visits booked yet."
              actionLabel="Open vaccinations"
              onAction={() => router.navigate('/vaccines')}
              styles={styles}
            />
          ) : (
            vaccines.map((b) => {
              const vaccine = VACCINES.find((v) => v.id === b.vaccineId);
              return (
                <Pressable
                  key={b.id}
                  onPress={() => router.navigate(`/vaccines/booking/${b.id}`)}
                  style={styles.card}
                  accessibilityRole="button"
                >
                  <View style={styles.cardCopy}>
                    <Text style={styles.title}>{vaccine?.name ?? 'Vaccination visit'}</Text>
                    <Text style={styles.meta}>
                      {formatIsoDate(b.date)}  |  {b.time || 'Time TBD'}  |  {b.place === 'clinic' ? 'Clinic' : 'Home'}  |  {childName(b.childId)}
                    </Text>
                    <Text style={styles.meta}>{formatINR(b.fee ?? (b.place === 'home' ? 799 : 499))}</Text>
                  </View>
                  <Text style={[styles.status, b.status === 'cancelled' && { color: theme.error }]}>
                    {b.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}
                  </Text>
                </Pressable>
              );
            })
          )
        ) : null}

        {tab === 'sitters' ? (
          sitterBookings.length === 0 ? (
            <EmptyBlock
              text="No babysitting bookings yet."
              actionLabel="Find a babysitter"
              onAction={() => router.navigate('/babysitting')}
              styles={styles}
            />
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

function EmptyBlock({
  text,
  actionLabel,
  onAction,
  styles,
}: {
  text: string;
  actionLabel: string;
  onAction: () => void;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.empty}>{text}</Text>
      <PrimaryButton label={actionLabel} onPress={onAction} />
    </View>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    tabs: { paddingHorizontal: 20, paddingBottom: 12 },
    content: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
    emptyWrap: { gap: 16, marginTop: 32 },
    empty: { fontFamily: FONT.regular, fontSize: 15, color: t.muted, textAlign: 'center' },
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

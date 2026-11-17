import { router } from 'expo-router';
import { Check, Circle, Clock, Home, Hospital } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { formatINR } from '@/lib/format';
import { dayOptions, formatIsoDate, openSlots, toIsoDate } from '@/lib/schedule';
import { FONT, type Palette } from '@/lib/theme';
import type { PaymentMethod, VaccinePlace } from '@/lib/types';
import {
  ageLabel,
  parseBirthDate,
  VACCINE_DISCLAIMER,
  VACCINE_SLOTS,
  VACCINES,
  dueDateFor,
  vaccineStatus,
  vaccineVisitFee,
  type Vaccine,
  type VaccineStatus,
} from '@/lib/vaccines';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { PrimaryButton } from '@/components/PrimaryButton';
import { DayPicker, SlotGrid } from '@/components/SchedulePickers';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchField } from '@/components/SearchField';
import { useToast } from '@/components/Toast';

type Row = { vaccine: Vaccine; dueIso: string; status: VaccineStatus };

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'cod', label: 'Pay at visit' },
];

export default function VaccinesScreen() {
  const {
    theme,
    children,
    activeChild,
    vaccinesGiven,
    vaccineBookings,
    setActiveChild,
    setChildBirthDate,
    toggleVaccineGiven,
    bookVaccine,
  } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const showToast = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(activeChild?.id ?? null);
  const selected = children.find((c) => c.id === selectedId) ?? children[0] ?? null;
  const todayIso = toIsoDate(new Date());
  const [place, setPlace] = useState<VaccinePlace>('clinic');
  const [bookingVaccineId, setBookingVaccineId] = useState<string | null>(null);
  const bookingDays = dayOptions(7);
  const [bookingDate, setBookingDate] = useState(bookingDays[0].iso);
  const [bookingTime, setBookingTime] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>('upi');
  const [query, setQuery] = useState('');
  const [processing, setProcessing] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  const fee = vaccineVisitFee(place);

  const slots = useMemo(() => {
    const takenSlots = (vaccineBookings ?? [])
      .filter((b) => b.status === 'confirmed' && b.place === place && b.date === bookingDate)
      .map((b) => b.time)
      .filter(Boolean) as string[];
    return openSlots([...VACCINE_SLOTS], place, bookingDate, takenSlots);
  }, [vaccineBookings, place, bookingDate]);

  const rows = useMemo<Row[]>(() => {
    if (!selected?.birthDate) return [];
    const givenSet = new Set(vaccinesGiven ?? []);
    const q = query.trim().toLowerCase();
    return VACCINES.filter(
      (vaccine) =>
        !q ||
        vaccine.name.toLowerCase().includes(q) ||
        vaccine.protects.toLowerCase().includes(q) ||
        vaccine.dueLabel.toLowerCase().includes(q),
    ).map((vaccine) => {
      const dueIso = dueDateFor(selected.birthDate as string, vaccine);
      const given = givenSet.has(`${selected.id}|${vaccine.id}`);
      return { vaccine, dueIso, status: vaccineStatus(given, dueIso, todayIso) };
    });
  }, [selected, vaccinesGiven, todayIso, query]);

  const dueRows = useMemo(() => rows.filter((r) => r.status === 'due'), [rows]);
  const upcomingRows = useMemo(() => rows.filter((r) => r.status === 'upcoming'), [rows]);
  const doneRows = useMemo(() => rows.filter((r) => r.status === 'done'), [rows]);
  const vaccineChoices = useMemo(() => (dueRows.length ? dueRows : upcomingRows), [dueRows, upcomingRows]);
  const vaccineChoiceKey = vaccineChoices.map((row) => row.vaccine.id).join('|');

  const childBookings = useMemo(
    () =>
      (vaccineBookings ?? [])
        .filter((b) => b.childId === selected?.id && b.status === 'confirmed')
        .sort((a, b) => b.createdAt - a.createdAt),
    [vaccineBookings, selected?.id],
  );

  // Keep a vaccine selected whenever the due/upcoming list changes.
  useEffect(() => {
    if (vaccineChoices.length === 0) {
      setBookingVaccineId(null);
      return;
    }
    if (!bookingVaccineId || !vaccineChoices.some((row) => row.vaccine.id === bookingVaccineId)) {
      setBookingVaccineId(vaccineChoices[0].vaccine.id);
    }
  }, [vaccineChoiceKey, bookingVaccineId, vaccineChoices]);

  // Keep an available time selected for the chosen day.
  useEffect(() => {
    const firstOpen = slots.find((slot) => slot.available)?.time ?? null;
    if (!firstOpen) {
      setBookingTime(null);
      return;
    }
    if (!bookingTime || !slots.some((slot) => slot.time === bookingTime && slot.available)) {
      setBookingTime(firstOpen);
      setTimeError(null);
    }
  }, [slots, bookingTime]);

  useEffect(() => {
    if (!processing || !selected || !bookingVaccineId || !bookingTime) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      try {
        const id = bookVaccine({
          childId: selected.id,
          vaccineId: bookingVaccineId,
          place,
          date: bookingDate,
          time: bookingTime,
          fee,
          payment,
        });
        setProcessing(false);
        router.push(`/vaccines/booking/${id}`);
      } catch {
        setProcessing(false);
        showToast('Could not complete booking. Please try again.');
      }
    }, 900);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // Capture once when payment processing starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processing]);

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

  const submitBooking = () => {
    if (!selected) return;
    if (vaccineChoices.length === 0) {
      showToast('No vaccines available to book right now.');
      return;
    }
    if (!bookingVaccineId) {
      setTimeError('Pick a vaccine to continue.');
      return;
    }
    if (!bookingTime) {
      setTimeError('Pick a visit time to continue.');
      return;
    }
    setTimeError(null);
    setProcessing(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Vaccinations" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                <View style={[styles.progressFill, { width: `${Math.round((givenCount / Math.max(rows.length, 1)) * 100)}%` }]} />
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

            <SearchField value={query} onChangeText={setQuery} placeholder="Search vaccine or disease" />

            {childBookings.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming bookings</Text>
                {childBookings.slice(0, 3).map((booking) => {
                  const vaccine = VACCINES.find((v) => v.id === booking.vaccineId);
                  return (
                    <Pressable
                      key={booking.id}
                      onPress={() => router.navigate(`/vaccines/booking/${booking.id}`)}
                      style={styles.bookingRow}
                      accessibilityRole="button"
                    >
                      <View style={styles.bookingCopy}>
                        <Text style={styles.bookingTitle}>{vaccine?.name ?? 'Vaccine'}</Text>
                        <Text style={styles.bookingMeta}>
                          {formatIsoDate(booking.date)} · {booking.time} · {booking.place === 'clinic' ? 'Clinic' : 'Home'}
                        </Text>
                      </View>
                      <Text style={styles.bookingFee}>{formatINR(booking.fee ?? fee)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            <View style={styles.bookCard}>
              <Text style={styles.cardTitle}>Book a vaccination visit</Text>
              <Text style={styles.cardBody}>Pick place, date, time and pay to confirm the visit.</Text>

              <Text style={styles.fieldLabel}>Visit type</Text>
              <FilterChips
                options={[
                  { value: 'clinic', label: `Clinic · ${formatINR(vaccineVisitFee('clinic'))}` },
                  { value: 'home', label: `At home · ${formatINR(vaccineVisitFee('home'))}` },
                ]}
                value={place}
                onChange={(value) => {
                  setPlace(value as VaccinePlace);
                  setBookingTime(null);
                }}
              />
              <View style={styles.placeRow}>
                {place === 'clinic' ? <Hospital size={16} color={theme.strong} /> : <Home size={16} color={theme.strong} />}
                <Text style={styles.placeHint}>
                  {place === 'clinic' ? 'Visit a partner clinic for the shot' : 'Trained nurse visits your home'}
                </Text>
              </View>

              <Text style={styles.fieldLabel}>Vaccine</Text>
              {vaccineChoices.length === 0 ? (
                <Text style={styles.emptyText}>No due or upcoming vaccines to book.</Text>
              ) : (
                <View style={styles.vaccineList}>
                  {vaccineChoices.slice(0, 6).map((row) => {
                    const active = bookingVaccineId === row.vaccine.id;
                    return (
                      <Pressable
                        key={row.vaccine.id}
                        onPress={() => {
                          setBookingVaccineId(row.vaccine.id);
                          setTimeError(null);
                        }}
                        style={[styles.vaccineOption, active && styles.vaccineOptionActive]}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: active }}
                      >
                        <Text style={[styles.vaccineOptionTitle, active && styles.vaccineOptionTitleActive]}>
                          {row.vaccine.name}
                        </Text>
                        <Text style={styles.vaccineOptionMeta}>
                          {row.status === 'due' ? 'Due now' : `Due ${formatIsoDate(row.dueIso)}`}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <Text style={styles.fieldLabel}>Date</Text>
              <DayPicker
                value={bookingDate}
                onChange={(iso) => {
                  setBookingDate(iso);
                  setBookingTime(null);
                }}
              />

              <Text style={styles.fieldLabel}>Time</Text>
              <SlotGrid
                slots={slots}
                value={bookingTime}
                onChange={(time) => {
                  setBookingTime(time);
                  setTimeError(null);
                }}
              />
              {timeError ? <Text style={styles.errorText}>{timeError}</Text> : null}

              <Text style={styles.fieldLabel}>Payment</Text>
              <FilterChips
                options={PAYMENT_OPTIONS}
                value={payment}
                onChange={(value) => setPayment(value as PaymentMethod)}
              />

              <View style={styles.feeBox}>
                <Text style={styles.feeLabel}>Visit fee</Text>
                <Text style={styles.feeValue}>{formatINR(fee)}</Text>
              </View>

              <PrimaryButton
                label={
                  processing
                    ? payment === 'cod'
                      ? 'Confirming…'
                      : 'Processing payment…'
                    : payment === 'cod'
                      ? `Book & pay ${formatINR(fee)} at visit`
                      : `Pay ${formatINR(fee)} & book`
                }
                disabled={processing || vaccineChoices.length === 0}
                loading={processing}
                onPress={submitBooking}
              />
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
    bookCard: {
      padding: 16,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      gap: 12,
    },
    fieldLabel: { fontFamily: FONT.bold, fontSize: 13, color: t.ink, marginTop: 4 },
    placeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    placeHint: { flex: 1, fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    vaccineList: { gap: 8 },
    vaccineOption: {
      padding: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.background,
      gap: 2,
    },
    vaccineOptionActive: { borderColor: t.strong, backgroundColor: t.secondary },
    vaccineOptionTitle: { fontFamily: FONT.bold, fontSize: 14, color: t.ink },
    vaccineOptionTitleActive: { color: t.strong },
    vaccineOptionMeta: { fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    feeBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: t.secondary,
    },
    feeLabel: { fontFamily: FONT.semibold, fontSize: 14, color: t.muted },
    feeValue: { fontFamily: FONT.bold, fontSize: 18, color: t.ink },
    bookingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 16,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    bookingCopy: { flex: 1, gap: 2 },
    bookingTitle: { fontFamily: FONT.bold, fontSize: 14, color: t.ink },
    bookingMeta: { fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    bookingFee: { fontFamily: FONT.bold, fontSize: 14, color: t.strong },
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

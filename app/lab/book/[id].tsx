import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { LABS, LAB_SLOTS, getLabTest } from '@/lib/labs';
import { formatINR } from '@/lib/format';
import { dayOptions, openSlots } from '@/lib/schedule';
import { FONT, type Palette } from '@/lib/theme';
import type { PaymentMethod } from '@/lib/types';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { DayPicker, SlotGrid } from '@/components/SchedulePickers';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Credit or debit card' },
  { value: 'cod', label: 'Pay after sample collection' },
];

export default function LabBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const test = getLabTest(id);
  const { theme, children, activeChild, addresses, labBookings, bookLabTest } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const days = dayOptions(7);

  const [labId, setLabId] = useState<string>(LABS[0].id);
  const [date, setDate] = useState(days[0].iso);
  const [slot, setSlot] = useState<string | null>(null);
  const [childId, setChildId] = useState<string | null>(activeChild?.id ?? children[0]?.id ?? null);
  const [address, setAddress] = useState(addresses[0]?.line ? `${addresses[0].line}, ${addresses[0].city} ${addresses[0].pincode}` : '');
  const [payment, setPayment] = useState<PaymentMethod>('upi');
  const [errors, setErrors] = useState<{ slot?: string; address?: string }>({});
  const [processing, setProcessing] = useState(false);

  const bookedSlots = labBookings
    .filter((b) => b.labId === labId && b.date === date)
    .map((b) => b.slot);
  const slots = openSlots(LAB_SLOTS, labId, date, bookedSlots);

  useEffect(() => {
    if (!processing || !test || !childId || !slot) return;
    const timer = setTimeout(() => {
      const bookingId = bookLabTest({
        testId: test.id,
        labId,
        date,
        slot,
        childId,
        address: address.trim(),
        fee: test.price,
        payment,
      });
      router.replace(`/lab/booking/${bookingId}`);
    }, 1600);
    return () => clearTimeout(timer);
    // The booking is captured once, when processing begins.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processing]);

  if (!test) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Book test" />
        <EmptyState title="Test not found" message="Please choose a test again." actionLabel="Back to lab tests" onAction={() => router.navigate('/lab')} />
      </SafeAreaView>
    );
  }

  const submit = () => {
    const next: typeof errors = {};
    if (!slot) next.slot = 'Pick a collection slot to continue.';
    if (address.trim().length < 10) next.address = 'Enter a full collection address (at least 10 characters).';
    setErrors(next);
    if (Object.keys(next).length === 0) setProcessing(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Home collection" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.testCard}>
          <Text style={styles.testName}>{test.name}</Text>
          <Text style={styles.testMeta}>{test.sample} sample  |  {formatINR(test.price)}</Text>
        </View>

        <Section title="Choose a lab" styles={styles}>
          {LABS.map((lab) => {
            const active = lab.id === labId;
            return (
              <Pressable
                key={lab.id}
                onPress={() => {
                  setLabId(lab.id);
                  setSlot(null);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.option, { borderColor: active ? theme.strong : theme.border }]}
              >
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{lab.name}</Text>
                  <Text style={styles.optionMeta}>{lab.distance}  |  Rated {lab.rating.toFixed(1)}</Text>
                </View>
                {active ? <CheckCircle2 size={20} color={theme.strong} /> : null}
              </Pressable>
            );
          })}
        </Section>

        <Section title="Choose a date" styles={styles}>
          <DayPicker
            value={date}
            onChange={(iso) => {
              setDate(iso);
              setSlot(null);
            }}
          />
        </Section>

        <Section title="Collection slot" styles={styles}>
          <SlotGrid
            slots={slots}
            value={slot}
            onChange={(time) => {
              setSlot(time);
              setErrors((e) => ({ ...e, slot: undefined }));
            }}
          />
          {errors.slot ? <Text style={styles.error}>{errors.slot}</Text> : null}
        </Section>

        <Section title="Who is the sample for?" styles={styles}>
          <FilterChips
            options={children.map((c) => ({ value: c.id, label: c.name }))}
            value={childId ?? ''}
            onChange={setChildId}
          />
        </Section>

        <Section title="Collection address" styles={styles}>
          <TextInput
            value={address}
            onChangeText={(text) => {
              setAddress(text);
              setErrors((e) => ({ ...e, address: undefined }));
            }}
            placeholder="Flat, street, area, city and pincode"
            placeholderTextColor={theme.muted}
            multiline
            style={[styles.input, errors.address && { borderColor: theme.error }]}
          />
          {errors.address ? <Text style={styles.error}>{errors.address}</Text> : null}
        </Section>

        <Section title="Payment" styles={styles}>
          {PAYMENT_OPTIONS.map((option) => {
            const active = option.value === payment;
            return (
              <Pressable
                key={option.value}
                onPress={() => setPayment(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.option, { borderColor: active ? theme.strong : theme.border }]}
              >
                <Text style={styles.optionTitle}>{option.label}</Text>
                {active ? <CheckCircle2 size={20} color={theme.strong} /> : null}
              </Pressable>
            );
          })}
        </Section>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={`Pay ${formatINR(test.price)} and book`}
          loading={processing}
          disabled={processing}
          onPress={submit}
        />
      </View>
    </SafeAreaView>
  );
}

function Section({ title, children, styles }: { title: string; children: React.ReactNode; styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 20 },
    testCard: { padding: 14, borderRadius: 16, backgroundColor: t.secondary, gap: 2 },
    testName: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    testMeta: { fontFamily: FONT.regular, fontSize: 13, color: t.ink },
    section: { gap: 12 },
    sectionTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      backgroundColor: t.card,
    },
    optionCopy: { flex: 1, gap: 2 },
    optionTitle: { fontFamily: FONT.semibold, fontSize: 15, color: t.ink },
    optionMeta: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    input: {
      minHeight: 80,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
      fontFamily: FONT.regular,
      fontSize: 15,
      color: t.ink,
      textAlignVertical: 'top',
    },
    error: { fontFamily: FONT.semibold, fontSize: 13, color: t.error },
    footer: { paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: t.border, backgroundColor: t.card },
  });
}

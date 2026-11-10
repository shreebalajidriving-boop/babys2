import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { formatINR } from '@/lib/format';
import { dayOptions, formatIsoDate, openSlots } from '@/lib/schedule';
import {
  endTimeFor,
  getSitter,
  maxHoursFrom,
  SITTER_DURATIONS,
  SITTER_REQUIREMENTS,
  SITTER_SLOTS,
  sitterTotal,
  type Sitter,
} from '@/lib/sitters';
import { FONT, type Palette } from '@/lib/theme';
import type { PaymentMethod } from '@/lib/types';
import { DayPicker, SlotGrid } from '@/components/SchedulePickers';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FormSection, RadioOption, StepProgress, SummaryRow } from '@/components/BookingSteps';

type Step = 'schedule' | 'details' | 'review';
const STEPS: Step[] = ['schedule', 'details', 'review'];
const STEP_LABELS = ['Schedule', 'Details', 'Review and pay'];

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Credit or debit card' },
];

const HOUR_OPTIONS = SITTER_DURATIONS.map((h) => ({ value: String(h), label: `${h} hours` }));

export default function BookSitterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sitter = getSitter(id);
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (!sitter) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Book sitter" />
        <EmptyState
          title="Sitter not found"
          message="Please choose a sitter again."
          actionLabel="Back to babysitters"
          onAction={() => router.navigate('/babysitting')}
        />
      </SafeAreaView>
    );
  }

  return <BookingFlow sitter={sitter} />;
}

function BookingFlow({ sitter }: { sitter: Sitter }) {
  const { theme, children, activeChild, addresses, sitterBookings, bookSitter } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const days = dayOptions(7);
  const defaultAddress = addresses[0];

  const [step, setStep] = useState<Step>('schedule');
  const [date, setDate] = useState(days[0].iso);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [hours, setHours] = useState<number>(SITTER_DURATIONS[0]);
  const [childId, setChildId] = useState<string | null>(activeChild?.id ?? children[0]?.id ?? null);
  const [address, setAddress] = useState(
    defaultAddress ? `${defaultAddress.line}, ${defaultAddress.city} ${defaultAddress.pincode}` : '',
  );
  const [requirements, setRequirements] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('upi');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const child = children.find((c) => c.id === childId) ?? null;
  const bookedTimes = sitterBookings
    .filter((b) => b.status === 'confirmed' && b.sitterId === sitter.id && b.date === date)
    .map((b) => b.startTime);
  const slots = openSlots(SITTER_SLOTS, sitter.id, date, bookedTimes);
  const maxHours = startTime ? maxHoursFrom(startTime) : SITTER_DURATIONS[SITTER_DURATIONS.length - 1];
  const hourOptions = HOUR_OPTIONS.filter((option) => Number(option.value) <= maxHours);
  const total = sitterTotal(sitter.hourlyRate, hours);
  const stepIndex = STEPS.indexOf(step);

  useEffect(() => {
    if (!processing || !child || !startTime) return;
    const timer = setTimeout(() => {
      const bookingId = bookSitter({
        sitterId: sitter.id,
        date,
        startTime,
        hours,
        childId: child.id,
        address: address.trim(),
        requirements,
        notes: notes.trim(),
        total,
        payment,
      });
      router.replace(`/babysitting/booking/${bookingId}?booked=1`);
    }, 1600);
    return () => clearTimeout(timer);
    // The booking runs once when processing starts; the other values are captured at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processing]);

  const toggleRequirement = (item: string) => {
    setRequirements((current) =>
      current.includes(item) ? current.filter((r) => r !== item) : [...current, item],
    );
  };

  const goNext = () => {
    if (step === 'schedule') {
      if (!startTime) return setError('Please pick a start time to continue.');
      setError(null);
      return setStep('details');
    }
    if (step === 'details') {
      if (!child) return setError('Add a child profile before booking a sitter.');
      if (address.trim().length < 10) return setError('Enter a full address, at least 10 characters.');
      setError(null);
      return setStep('review');
    }
  };

  const goBack = () => {
    setError(null);
    if (stepIndex === 0) return router.back();
    setStep(STEPS[stepIndex - 1]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Book a sitter" onBack={goBack} />
      <StepProgress labels={STEP_LABELS} index={stepIndex} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.sitterCard}>
          <Text style={styles.sitterName}>{sitter.name}</Text>
          <Text style={styles.sitterMeta}>{formatINR(sitter.hourlyRate)} per hour  |  {sitter.experience} years experience</Text>
        </View>

        {step === 'schedule' ? (
          <>
            <FormSection title="Choose a date">
              <DayPicker
                value={date}
                onChange={(iso) => {
                  setDate(iso);
                  setStartTime(null);
                }}
              />
            </FormSection>
            <FormSection title="Start time">
              <SlotGrid
                slots={slots}
                value={startTime}
                onChange={(time) => {
                  setStartTime(time);
                  setHours((current) => Math.min(current, maxHoursFrom(time)));
                  setError(null);
                }}
              />
              <Text style={styles.hint}>Greyed-out times are already booked with this sitter.</Text>
            </FormSection>
            <FormSection title="How long do you need them?">
              <FilterChips
                options={hourOptions}
                value={String(hours)}
                onChange={(value) => setHours(Number(value))}
              />
              {startTime ? (
                <Text style={styles.hint}>
                  {startTime} to {endTimeFor(startTime, hours)}. Bookings must end by 11:00 PM.
                </Text>
              ) : null}
            </FormSection>
          </>
        ) : null}

        {step === 'details' ? (
          <>
            <FormSection title="Who needs care?">
              {children.length === 0 ? (
                <View style={styles.noChild}>
                  <Text style={styles.body}>You need a child profile before booking a sitter.</Text>
                  <PrimaryButton label="Add a child" variant="outline" onPress={() => router.navigate('/child/new')} />
                </View>
              ) : (
                <FilterChips
                  options={children.map((c) => ({ value: c.id, label: c.name }))}
                  value={childId ?? ''}
                  onChange={setChildId}
                />
              )}
            </FormSection>
            <FormSection title="Address">
              <TextInput
                value={address}
                onChangeText={(text) => {
                  setAddress(text);
                  if (error) setError(null);
                }}
                placeholder="Flat, street, area and pincode"
                placeholderTextColor={theme.muted}
                multiline
                style={[styles.input, styles.addressInput]}
              />
            </FormSection>
            <FormSection title="What should the sitter help with?">
              <View style={styles.chips}>
                {SITTER_REQUIREMENTS.map((item) => {
                  const active = requirements.includes(item);
                  return (
                    <Pressable
                      key={item}
                      onPress={() => toggleRequirement(item)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: active }}
                      style={[
                        styles.chip,
                        { borderColor: active ? theme.strong : theme.border, backgroundColor: active ? theme.strong : theme.card },
                      ]}
                    >
                      <Text style={[styles.chipText, { color: active ? '#FFFFFF' : theme.ink }]}>{item}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </FormSection>
            <FormSection title="Notes for the sitter (optional)">
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Allergies, routines, or where things are kept"
                placeholderTextColor={theme.muted}
                multiline
                style={[styles.input, styles.notesInput]}
              />
            </FormSection>
          </>
        ) : null}

        {step === 'review' ? (
          <>
            <FormSection title="Summary">
              <SummaryRow label="Sitter" value={sitter.name} />
              <SummaryRow label="Date" value={formatIsoDate(date)} />
              <SummaryRow label="Time" value={startTime ? `${startTime} to ${endTimeFor(startTime, hours)}` : '-'} />
              <SummaryRow label="Duration" value={`${hours} hours`} />
              <SummaryRow label="Child" value={child?.name ?? '-'} />
              <SummaryRow label="Help with" value={requirements.length ? requirements.join(', ') : 'General care'} />
              <View style={styles.divider} />
              <SummaryRow label={`${formatINR(sitter.hourlyRate)} x ${hours} hours`} value={formatINR(total)} />
              <SummaryRow label="Total" value={formatINR(total)} bold />
            </FormSection>
            <FormSection title="Payment method">
              {PAYMENT_OPTIONS.map((option) => (
                <RadioOption
                  key={option.value}
                  label={option.label}
                  selected={option.value === payment}
                  onPress={() => setPayment(option.value)}
                />
              ))}
            </FormSection>
          </>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        {step === 'review' ? (
          <PrimaryButton
            label={`Pay ${formatINR(total)} and confirm`}
            loading={processing}
            disabled={processing}
            onPress={() => {
              if (!child) return setError('Add a child profile before booking a sitter.');
              setError(null);
              setProcessing(true);
            }}
          />
        ) : (
          <PrimaryButton label="Continue" onPress={goNext} disabled={step === 'details' && children.length === 0} />
        )}
      </View>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 20 },
    sitterCard: { padding: 14, borderRadius: 16, backgroundColor: t.secondary, gap: 2 },
    sitterName: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    sitterMeta: { fontFamily: FONT.regular, fontSize: 13, color: t.ink },
    hint: { fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    body: { fontFamily: FONT.regular, fontSize: 14, color: t.ink },
    error: { fontFamily: FONT.semibold, fontSize: 13, color: t.error },
    noChild: { gap: 12, padding: 14, borderRadius: 14, backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
    input: {
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
    addressInput: { minHeight: 72 },
    notesInput: { minHeight: 96 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
    chipText: { fontFamily: FONT.semibold, fontSize: 13 },
    divider: { height: 1, backgroundColor: t.border },
    footer: { paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: t.border, backgroundColor: t.card },
  });
}

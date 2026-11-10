import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { CONSULT_SLOTS, getDoctor, type Doctor } from '@/lib/doctors';
import { formatINR } from '@/lib/format';
import { dayOptions, formatIsoDate, openSlots } from '@/lib/schedule';
import { FONT, type Palette } from '@/lib/theme';
import type { ConsultMode, PaymentMethod } from '@/lib/types';
import { EmptyState } from '@/components/EmptyState';
import { DayPicker, SlotGrid } from '@/components/SchedulePickers';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FilterChips } from '@/components/FilterChips';

type Step = 'slot' | 'details' | 'review';
const STEP_ORDER: Step[] = ['slot', 'details', 'review'];
const STEP_LABEL: Record<Step, string> = { slot: 'Date and time', details: 'Patient details', review: 'Review and pay' };

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Credit or debit card' },
  { value: 'cod', label: 'Pay at clinic' },
];

export default function BookAppointmentScreen() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const doctor = getDoctor(id);
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (!doctor) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Book visit" />
        <EmptyState title="Doctor not found" message="Please choose a doctor again." actionLabel="Back to Care" onAction={() => router.navigate('/care')} />
      </SafeAreaView>
    );
  }

  const consultMode: ConsultMode = mode === 'offline' ? 'offline' : 'online';
  return <BookingFlow doctor={doctor} mode={consultMode} />;
}

function BookingFlow({ doctor, mode }: { doctor: Doctor; mode: ConsultMode }) {
  const { theme, children, activeChild, appointments, bookAppointment } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const days = dayOptions(7);

  const [step, setStep] = useState<Step>('slot');
  const [date, setDate] = useState(days[0].iso);
  const [time, setTime] = useState<string | null>(null);
  const [childId, setChildId] = useState<string | null>(activeChild?.id ?? children[0]?.id ?? null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>(mode === 'offline' ? 'cod' : 'upi');
  const [processing, setProcessing] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  const fee = mode === 'online' ? doctor.onlineFee : doctor.offlineFee;
  const child = children.find((c) => c.id === childId) ?? null;
  const bookedTimes = appointments
    .filter((a) => a.status === 'confirmed' && a.doctorId === doctor.id && a.date === date)
    .map((a) => a.time);
  const slots = openSlots(CONSULT_SLOTS, doctor.id, date, bookedTimes);
  const paymentOptions = mode === 'online' ? PAYMENT_OPTIONS.filter((o) => o.value !== 'cod') : PAYMENT_OPTIONS;
  const stepIndex = STEP_ORDER.indexOf(step);

  useEffect(() => {
    if (!processing || !child || !time) return;
    const timer = setTimeout(() => {
      const appointmentId = bookAppointment({
        doctorId: doctor.id,
        mode,
        date,
        time,
        childId: child.id,
        reason: reason.trim(),
        fee,
        payment,
      });
      router.replace(`/appointment/${appointmentId}?booked=1`);
    }, 1600);
    return () => clearTimeout(timer);
    // The booking runs once when processing starts; the other values are captured at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processing]);

  const goNext = () => {
    if (step === 'slot') {
      if (!time) return setTimeError('Please pick a time slot to continue.');
      setTimeError(null);
      return setStep('details');
    }
    if (step === 'details') {
      if (!child) return;
      if (reason.trim().length < 5) return setReasonError('Tell the doctor a little more, at least 5 characters.');
      setReasonError(null);
      return setStep('review');
    }
  };

  const goBack = () => {
    if (stepIndex === 0) return router.back();
    setStep(STEP_ORDER[stepIndex - 1]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={mode === 'online' ? 'Online consult' : 'Clinic visit'} onBack={goBack} />
      <View style={styles.progress}>
        {STEP_ORDER.map((s, index) => (
          <View key={s} style={styles.progressItem}>
            <View style={[styles.progressBar, index <= stepIndex && { backgroundColor: theme.strong }]} />
            <Text style={[styles.progressLabel, index === stepIndex && { color: theme.strong }]}>
              {index + 1}. {STEP_LABEL[s]}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.doctorCard}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorMeta}>{doctor.specialty}  |  {formatINR(fee)} {mode === 'online' ? 'online' : 'at clinic'}</Text>
        </View>

        {step === 'slot' ? (
          <>
            <Section title="Choose a date" styles={styles}>
              <DayPicker
                value={date}
                onChange={(iso) => {
                  setDate(iso);
                  setTime(null);
                }}
              />
            </Section>
            <Section title="Choose a time" styles={styles}>
              <SlotGrid slots={slots} value={time} onChange={(t) => { setTime(t); setTimeError(null); }} />
              {timeError ? <Text style={styles.error}>{timeError}</Text> : null}
              <Text style={styles.hint}>Greyed-out slots are already taken.</Text>
            </Section>
          </>
        ) : null}

        {step === 'details' ? (
          <>
            <Section title="Who is this visit for?" styles={styles}>
              <FilterChips
                options={children.map((c) => ({ value: c.id, label: c.name }))}
                value={childId ?? ''}
                onChange={setChildId}
              />
            </Section>
            <Section title="Reason for visit" styles={styles}>
              <TextInput
                value={reason}
                onChangeText={(text) => {
                  setReason(text);
                  if (reasonError) setReasonError(null);
                }}
                placeholder="e.g. Fever since last night, feeding concerns"
                placeholderTextColor={theme.muted}
                multiline
                style={[styles.input, reasonError && { borderColor: theme.error }]}
              />
              {reasonError ? <Text style={styles.error}>{reasonError}</Text> : null}
            </Section>
          </>
        ) : null}

        {step === 'review' ? (
          <>
            <Section title="Summary" styles={styles}>
              <SummaryRow label="Doctor" value={doctor.name} styles={styles} />
              <SummaryRow label="Type" value={mode === 'online' ? 'Online video consult' : 'Clinic visit'} styles={styles} />
              <SummaryRow label="When" value={`${formatIsoDate(date)}, ${time}`} styles={styles} />
              <SummaryRow label="Patient" value={child?.name ?? '-'} styles={styles} />
              <SummaryRow label="Reason" value={reason.trim()} styles={styles} />
              <View style={styles.divider} />
              <SummaryRow label="Consultation fee" value={formatINR(fee)} styles={styles} bold />
            </Section>
            <Section title="Payment method" styles={styles}>
              {paymentOptions.map((option) => {
                const active = option.value === payment;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setPayment(option.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={[styles.payOption, { borderColor: active ? theme.strong : theme.border }]}
                  >
                    <View style={[styles.radio, { borderColor: active ? theme.strong : theme.muted }]}>
                      {active ? <View style={[styles.radioDot, { backgroundColor: theme.strong }]} /> : null}
                    </View>
                    <Text style={styles.payLabel}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </Section>
          </>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {step === 'review' ? (
          <PrimaryButton
            label={`Pay ${formatINR(fee)} and confirm`}
            loading={processing}
            disabled={processing}
            onPress={() => setProcessing(true)}
          />
        ) : (
          <PrimaryButton label="Continue" onPress={goNext} />
        )}
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

function SummaryRow({ label, value, styles, bold }: { label: string; value: string; styles: ReturnType<typeof makeStyles>; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, bold && { fontFamily: FONT.bold }]}>{value}</Text>
    </View>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    progress: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 8 },
    progressItem: { flex: 1, gap: 6 },
    progressBar: { height: 4, borderRadius: 2, backgroundColor: t.border },
    progressLabel: { fontFamily: FONT.semibold, fontSize: 11, color: t.muted },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 20 },
    doctorCard: {
      padding: 14,
      borderRadius: 16,
      backgroundColor: t.secondary,
      gap: 2,
    },
    doctorName: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    doctorMeta: { fontFamily: FONT.regular, fontSize: 13, color: t.ink },
    section: { gap: 12 },
    sectionTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    hint: { fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    error: { fontFamily: FONT.semibold, fontSize: 13, color: t.error },
    input: {
      minHeight: 96,
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
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    summaryLabel: { fontFamily: FONT.regular, fontSize: 14, color: t.muted },
    summaryValue: { flexShrink: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink, textAlign: 'right' },
    divider: { height: 1, backgroundColor: t.border },
    payOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      backgroundColor: t.card,
    },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    radioDot: { width: 10, height: 10, borderRadius: 5 },
    payLabel: { fontFamily: FONT.semibold, fontSize: 15, color: t.ink },
    footer: { paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: t.border, backgroundColor: t.card },
  });
}

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { formatINR } from '@/lib/format';
import { getInsurancePlan, INSURANCE_FREQUENCY_OPTIONS, isValidCover, NOMINEE_RELATIONS, premiumFor, type InsurancePlan } from '@/lib/insurance';
import { FONT, type Palette } from '@/lib/theme';
import type { InsuranceFrequency, PaymentMethod } from '@/lib/types';
import { FormSection, RadioOption, StepProgress, SummaryRow } from '@/components/BookingSteps';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';

type Step = 'details' | 'review';
const STEPS: Step[] = ['details', 'review'];
const STEP_LABELS = ['Details', 'Review and pay'];

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Credit or debit card' },
];

export default function InsuranceApplyScreen() {
  const { id, cover, frequency } = useLocalSearchParams<{ id: string; cover: string; frequency: string }>();
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const plan = getInsurancePlan(id);
  const coverAmount = Number(cover);
  const cadence = frequency === 'yearly' || frequency === 'monthly' ? frequency : null;

  if (!plan || !cadence || !isValidCover(plan, coverAmount)) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Apply" />
        <EmptyState
          title="Choose your cover again"
          message="This application link is no longer valid."
          actionLabel="Back to insurance"
          onAction={() => router.navigate('/insurance')}
        />
      </SafeAreaView>
    );
  }

  return <ApplicationFlow plan={plan} cover={coverAmount} frequency={cadence} />;
}

function ApplicationFlow({
  plan,
  cover,
  frequency,
}: {
  plan: InsurancePlan;
  cover: number;
  frequency: InsuranceFrequency;
}) {
  const { theme, children, activeChild, addInsurancePolicy } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [step, setStep] = useState<Step>('details');
  const [childId, setChildId] = useState<string | null>(activeChild?.id ?? children[0]?.id ?? null);
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('upi');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const child = children.find((c) => c.id === childId) ?? null;
  const premium = premiumFor(plan, cover, frequency);
  const stepIndex = STEPS.indexOf(step);

  useEffect(() => {
    if (!processing || !child) return;
    const timer = setTimeout(() => {
      const policyId = addInsurancePolicy({
        planId: plan.id,
        childId: child.id,
        cover,
        frequency,
        premium,
        nomineeName: nomineeName.trim(),
        nomineeRelation,
        payment,
      });
      router.replace(`/insurance/policy/${policyId}?new=1`);
    }, 1600);
    return () => clearTimeout(timer);
    // The policy is created once when processing starts; the other values are captured at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processing]);

  const goNext = () => {
    if (!child) return setError('Add a child profile before applying.');
    if (nomineeName.trim().length < 2) return setError('Enter the nominee’s full name.');
    if (!nomineeRelation) return setError('Choose how the nominee is related to your child.');
    setError(null);
    setStep('review');
  };

  const goBack = () => {
    setError(null);
    if (stepIndex === 0) return router.back();
    setStep(STEPS[stepIndex - 1]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Apply for cover" onBack={goBack} />
      <StepProgress labels={STEP_LABELS} index={stepIndex} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.planCard}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planMeta}>
            {formatINR(cover)} cover  |  {formatINR(premium)} {frequency === 'monthly' ? 'per month' : 'per year'}
          </Text>
        </View>

        {step === 'details' ? (
          <>
            <FormSection title="Who is covered?">
              {children.length === 0 ? (
                <View style={styles.noChild}>
                  <Text style={styles.body}>You need a child profile before applying.</Text>
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
            <FormSection title="Nominee">
              <TextInput
                value={nomineeName}
                onChangeText={(text) => {
                  setNomineeName(text);
                  if (error) setError(null);
                }}
                placeholder="Full name of the nominee"
                placeholderTextColor={theme.muted}
                maxLength={60}
                style={styles.input}
                accessibilityLabel="Nominee full name"
              />
              <FilterChips
                options={NOMINEE_RELATIONS.map((relation) => ({ value: relation, label: relation }))}
                value={nomineeRelation}
                onChange={(value) => {
                  setNomineeRelation(value);
                  if (error) setError(null);
                }}
              />
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

        {step === 'review' ? (
          <FormSection title="Summary">
            <SummaryRow label="Plan" value={plan.name} />
            <SummaryRow label="Covered child" value={child?.name ?? '-'} />
            <SummaryRow label="Cover amount" value={formatINR(cover)} />
            <SummaryRow label="Payment" value={frequency === 'monthly' ? 'Monthly' : 'Yearly'} />
            <SummaryRow label="Nominee" value={`${nomineeName.trim()} (${nomineeRelation})`} />
            <View style={styles.divider} />
            <SummaryRow label="Total today" value={formatINR(premium)} bold />
          </FormSection>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        {step === 'review' ? (
          <PrimaryButton
            label={`Pay ${formatINR(premium)} and activate`}
            loading={processing}
            disabled={processing}
            onPress={() => {
              if (!child) return setError('Add a child profile before applying.');
              setError(null);
              setProcessing(true);
            }}
          />
        ) : (
          <PrimaryButton label="Continue" onPress={goNext} disabled={children.length === 0} />
        )}
      </View>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 20 },
    planCard: { padding: 14, borderRadius: 16, backgroundColor: t.secondary, gap: 2 },
    planName: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    planMeta: { fontFamily: FONT.regular, fontSize: 13, color: t.ink },
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
    },
    divider: { height: 1, backgroundColor: t.border },
    footer: { paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: t.border, backgroundColor: t.card },
  });
}

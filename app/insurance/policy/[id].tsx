import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, XCircle } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from '@/components/Toast';
import { useApp } from '@/lib/AppContext';
import { formatINR } from '@/lib/format';
import { getInsurancePlan } from '@/lib/insurance';
import { FONT, type Palette } from '@/lib/theme';
import type { PaymentMethod } from '@/lib/types';
import { FormSection, SummaryRow } from '@/components/BookingSteps';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  upi: 'UPI',
  card: 'Credit or debit card',
  cod: 'Pay at clinic',
};

export default function InsurancePolicyScreen() {
  const { id, new: isNew } = useLocalSearchParams<{ id: string; new?: string }>();
  const { theme, insurancePolicies, children, cancelInsurancePolicy } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const showToast = useToast();
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const policy = insurancePolicies.find((p) => p.id === id);
  const plan = policy ? getInsurancePlan(policy.planId) : undefined;

  if (!policy || !plan) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Policy" />
        <EmptyState
          title="Policy not found"
          message="This insurance policy could not be found."
          actionLabel="Back to insurance"
          onAction={() => router.navigate('/insurance')}
        />
      </SafeAreaView>
    );
  }

  const cancelled = policy.status === 'cancelled';
  const childName = children.find((c) => c.id === policy.childId)?.name ?? '-';

  const cancelPolicy = () => {
    cancelInsurancePolicy(policy.id);
    setConfirmingCancel(false);
    showToast('Policy cancelled.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Insurance policy" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {cancelled ? (
          <View style={[styles.banner, { backgroundColor: theme.card, borderColor: theme.error }]}>
            <XCircle size={22} color={theme.error} />
            <Text style={[styles.bannerText, { color: theme.ink }]}>This policy was cancelled.</Text>
          </View>
        ) : isNew === '1' ? (
          <View style={[styles.banner, { backgroundColor: theme.secondary, borderColor: theme.strong }]}>
            <CheckCircle2 size={22} color={theme.strong} />
            <Text style={[styles.bannerText, { color: theme.ink }]}>Your policy is active and {childName} is covered.</Text>
          </View>
        ) : null}

        <View style={styles.planCard}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planMeta}>Policy {policy.id}</Text>
        </View>

        <FormSection title="Cover">
          <SummaryRow label="Covered child" value={childName} />
          <SummaryRow label="Cover amount" value={formatINR(policy.cover)} />
          <SummaryRow label="Premium" value={`${formatINR(policy.premium)} ${policy.frequency === 'monthly' ? 'per month' : 'per year'}`} />
          <SummaryRow label="Nominee" value={`${policy.nomineeName} (${policy.nomineeRelation})`} />
        </FormSection>

        <FormSection title="Payment">
          <SummaryRow label="Paid by" value={PAYMENT_LABEL[policy.payment]} />
          <SummaryRow label="Total paid" value={formatINR(policy.premium)} bold />
        </FormSection>

        {!cancelled ? (
          <View style={styles.actions}>
            {confirmingCancel ? (
              <View style={[styles.confirm, { borderColor: theme.error, backgroundColor: theme.card }]}>
                <Text style={[styles.confirmTitle, { color: theme.ink }]}>Cancel this policy?</Text>
                <Text style={[styles.confirmBody, { color: theme.muted }]}>
                  Cover for {childName} will stop. You can apply for a new policy at any time.
                </Text>
                <PrimaryButton label="Yes, cancel policy" onPress={cancelPolicy} />
                <PrimaryButton label="Keep policy" variant="outline" onPress={() => setConfirmingCancel(false)} />
              </View>
            ) : (
              <PrimaryButton label="Cancel policy" variant="outline" onPress={() => setConfirmingCancel(true)} />
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 20 },
    banner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
    bannerText: { flex: 1, fontFamily: FONT.semibold, fontSize: 14 },
    planCard: { padding: 14, borderRadius: 16, backgroundColor: t.secondary, gap: 2 },
    planName: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    planMeta: { fontFamily: FONT.regular, fontSize: 13, color: t.ink },
    actions: { gap: 12 },
    confirm: { gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
    confirmTitle: { fontFamily: FONT.bold, fontSize: 15 },
    confirmBody: { fontFamily: FONT.regular, fontSize: 13 },
  });
}

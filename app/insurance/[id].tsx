import { router, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { formatINR } from '@/lib/format';
import { getInsurancePlan, INSURANCE_FREQUENCY_OPTIONS, premiumFor, type InsurancePlan } from '@/lib/insurance';
import { FONT, type Palette } from '@/lib/theme';
import type { InsuranceFrequency } from '@/lib/types';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function InsurancePlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const plan = getInsurancePlan(id);

  if (!plan) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Insurance plan" />
        <EmptyState
          title="Plan not found"
          message="Please choose a plan again."
          actionLabel="Back to insurance"
          onAction={() => router.navigate('/insurance')}
        />
      </SafeAreaView>
    );
  }

  return <PlanDetail plan={plan} />;
}

function PlanDetail({ plan }: { plan: InsurancePlan }) {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [cover, setCover] = useState(plan.coverOptions[0]);
  const [frequency, setFrequency] = useState<InsuranceFrequency>('monthly');
  const premium = premiumFor(plan, cover, frequency);
  const coverOptions = plan.coverOptions.map((amount) => ({ value: String(amount), label: formatINR(amount) }));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={plan.category} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.name}>{plan.name}</Text>
          <Text style={styles.summary}>{plan.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is included</Text>
          {plan.highlights.map((item) => (
            <View key={item} style={styles.highlightRow}>
              <Check size={16} color={theme.strong} />
              <Text style={styles.highlightText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose cover</Text>
          <FilterChips options={coverOptions} value={String(cover)} onChange={(value) => setCover(Number(value))} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How you pay</Text>
          <FilterChips options={INSURANCE_FREQUENCY_OPTIONS} value={frequency} onChange={setFrequency} />
        </View>

        <View style={styles.premiumCard}>
          <Text style={styles.premiumLabel}>{frequency === 'monthly' ? 'Monthly premium' : 'Yearly premium'}</Text>
          <Text style={styles.premiumValue}>{formatINR(premium)}</Text>
          <Text style={styles.premiumMeta}>For {formatINR(cover)} cover</Text>
        </View>

        <PrimaryButton
          label="Continue to apply"
          onPress={() => router.navigate(`/insurance/apply/${plan.id}?cover=${cover}&frequency=${frequency}`)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingBottom: 32, gap: 24 },
    hero: { gap: 8 },
    name: { fontFamily: FONT.bold, fontSize: 24, color: t.ink, lineHeight: 30 },
    summary: { fontFamily: FONT.regular, fontSize: 14, color: t.muted, lineHeight: 21 },
    section: { gap: 12 },
    sectionTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    highlightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    highlightText: { flex: 1, fontFamily: FONT.regular, fontSize: 14, color: t.ink, lineHeight: 21 },
    premiumCard: { padding: 20, borderRadius: 18, backgroundColor: t.secondary, gap: 4 },
    premiumLabel: { fontFamily: FONT.semibold, fontSize: 13, color: t.ink },
    premiumValue: { fontFamily: FONT.bold, fontSize: 28, color: t.ink },
    premiumMeta: { fontFamily: FONT.regular, fontSize: 13, color: t.ink },
  });
}

import { router } from 'expo-router';
import { ChevronRight, ShieldCheck } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { formatINR } from '@/lib/format';
import { getInsurancePlan, INSURANCE_DISCLAIMER, INSURANCE_PLANS, premiumFor, type InsurancePlan } from '@/lib/insurance';
import { FONT, type Palette } from '@/lib/theme';
import type { InsurancePolicy } from '@/lib/types';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function InsuranceScreen() {
  const { theme, insurancePolicies } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Child insurance" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Protect your child’s health, accidents and future with simple, transparent cover.</Text>

        {insurancePolicies.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My policies</Text>
            {insurancePolicies.map((policy) => (
              <PolicyRow key={policy.id} policy={policy} styles={styles} theme={theme} />
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plans for your child</Text>
          {INSURANCE_PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} styles={styles} theme={theme} />
          ))}
        </View>

        <Text style={styles.disclaimer}>{INSURANCE_DISCLAIMER}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanCard({ plan, styles, theme }: { plan: InsurancePlan; styles: ReturnType<typeof makeStyles>; theme: Palette }) {
  const from = premiumFor(plan, plan.coverOptions[0], 'monthly');
  return (
    <Pressable
      onPress={() => router.navigate(`/insurance/${plan.id}`)}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`View ${plan.name}`}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.secondary }]}>
        <ShieldCheck size={22} color={theme.strong} />
      </View>
      <View style={styles.cardCopy}>
        <Text style={styles.category}>{plan.category}</Text>
        <Text style={styles.cardTitle}>{plan.name}</Text>
        <Text style={styles.cardBody}>{plan.summary}</Text>
        <Text style={styles.price}>From {formatINR(from)} per month</Text>
      </View>
      <ChevronRight size={18} color={theme.muted} />
    </Pressable>
  );
}

function PolicyRow({ policy, styles, theme }: { policy: InsurancePolicy; styles: ReturnType<typeof makeStyles>; theme: Palette }) {
  const plan = getInsurancePlan(policy.planId);
  const cancelled = policy.status === 'cancelled';
  return (
    <Pressable
      onPress={() => router.navigate(`/insurance/policy/${policy.id}`)}
      style={styles.policyRow}
      accessibilityRole="button"
      accessibilityLabel={`View policy for ${plan?.name ?? 'insurance'}`}
    >
      <View style={styles.policyCopy}>
        <Text style={styles.cardTitle}>{plan?.name ?? 'Insurance policy'}</Text>
        <Text style={styles.cardBody}>
          {formatINR(policy.cover)} cover  |  {formatINR(policy.premium)} {policy.frequency === 'monthly' ? 'per month' : 'per year'}
        </Text>
        <Text style={[styles.status, { color: cancelled ? theme.muted : theme.strong }]}>
          {cancelled ? 'Cancelled' : 'Active'}
        </Text>
      </View>
      <ChevronRight size={18} color={theme.muted} />
    </Pressable>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingBottom: 32, gap: 24 },
    intro: { fontFamily: FONT.regular, fontSize: 14, color: t.muted, lineHeight: 21 },
    section: { gap: 12 },
    sectionTitle: { fontFamily: FONT.bold, fontSize: 18, color: t.ink },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 16,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    iconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    cardCopy: { flex: 1, gap: 4 },
    category: { fontFamily: FONT.bold, fontSize: 11, color: t.strong, textTransform: 'uppercase', letterSpacing: 0.5 },
    cardTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    cardBody: { fontFamily: FONT.regular, fontSize: 13, color: t.muted, lineHeight: 19 },
    price: { fontFamily: FONT.semibold, fontSize: 13, color: t.ink, marginTop: 4 },
    policyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      borderRadius: 18,
      backgroundColor: t.secondary,
    },
    policyCopy: { flex: 1, gap: 4 },
    status: { fontFamily: FONT.bold, fontSize: 12, marginTop: 2 },
    disclaimer: { fontFamily: FONT.regular, fontSize: 12, color: t.muted, lineHeight: 18 },
  });
}

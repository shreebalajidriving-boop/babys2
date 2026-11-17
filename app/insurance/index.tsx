import { router } from 'expo-router';
import { ChevronRight, ShieldCheck } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { formatINR } from '@/lib/format';
import {
  getInsurancePlan,
  getInsuranceType,
  INSURANCE_DISCLAIMER,
  INSURANCE_TYPES,
  plansForType,
  typeStartingFrom,
  type InsuranceType,
} from '@/lib/insurance';
import { FONT, type Palette } from '@/lib/theme';
import type { InsurancePolicy } from '@/lib/types';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchField } from '@/components/SearchField';

export default function InsuranceScreen() {
  const { theme, insurancePolicies } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const types = INSURANCE_TYPES.filter(
    (type) =>
      !q ||
      type.label.toLowerCase().includes(q) ||
      type.summary.toLowerCase().includes(q) ||
      plansForType(type.id).some((plan) => plan.name.toLowerCase().includes(q)),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Child insurance" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          Choose one cover type first. Then compare how SecureCare, BrightLife and NestShield offer that same cover.
        </Text>

        {insurancePolicies.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My policies</Text>
            {insurancePolicies.map((policy) => (
              <PolicyRow key={policy.id} policy={policy} styles={styles} theme={theme} />
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search cover type</Text>
          <SearchField value={query} onChangeText={setQuery} placeholder="Search health, accident, savings…" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insurance types</Text>
          {types.map((type) => (
            <TypeCard key={type.id} type={type} styles={styles} theme={theme} />
          ))}
          {types.length === 0 ? <Text style={styles.empty}>No cover type matches that search.</Text> : null}
        </View>

        <Text style={styles.disclaimer}>{INSURANCE_DISCLAIMER}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function TypeCard({
  type,
  styles,
  theme,
}: {
  type: InsuranceType;
  styles: ReturnType<typeof makeStyles>;
  theme: Palette;
}) {
  const companyCount = plansForType(type.id).length;
  const from = typeStartingFrom(type.id);
  return (
    <Pressable
      onPress={() => router.navigate(`/insurance/compare?type=${type.id}`)}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`Compare ${type.label}`}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.secondary }]}>
        <ShieldCheck size={22} color={theme.strong} />
      </View>
      <View style={styles.cardCopy}>
        <Text style={styles.category}>{companyCount} companies offer this</Text>
        <Text style={styles.cardTitle}>{type.label}</Text>
        <Text style={styles.cardBody}>{type.summary}</Text>
        <Text style={styles.price}>Compare from {formatINR(from)} / month</Text>
      </View>
      <ChevronRight size={18} color={theme.muted} />
    </Pressable>
  );
}

function PolicyRow({ policy, styles, theme }: { policy: InsurancePolicy; styles: ReturnType<typeof makeStyles>; theme: Palette }) {
  const plan = getInsurancePlan(policy.planId);
  const type = plan ? getInsuranceType(plan.typeId) : null;
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
          {type?.label ?? plan?.category ?? 'Cover'} · {formatINR(policy.cover)} · {formatINR(policy.premium)}{' '}
          {policy.frequency === 'monthly' ? '/ mo' : '/ yr'}
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
      gap: 12,
      padding: 14,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    cardCopy: { flex: 1, gap: 2 },
    category: { fontFamily: FONT.semibold, fontSize: 12, color: t.strong },
    cardTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    cardBody: { fontFamily: FONT.regular, fontSize: 13, color: t.muted, lineHeight: 18 },
    price: { fontFamily: FONT.bold, fontSize: 13, color: t.ink, marginTop: 4 },
    empty: { fontFamily: FONT.regular, fontSize: 14, color: t.muted },
    policyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 16,
      backgroundColor: t.secondary,
    },
    policyCopy: { flex: 1, gap: 2 },
    status: { fontFamily: FONT.semibold, fontSize: 12, marginTop: 2 },
    disclaimer: { fontFamily: FONT.regular, fontSize: 12, color: t.muted, lineHeight: 17 },
  });
}

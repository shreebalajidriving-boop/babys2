import { router, useLocalSearchParams } from 'expo-router';
import { Check, Minus } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import {
  getInsuranceCompany,
  getInsuranceType,
  INSURANCE_DISCLAIMER,
  INSURANCE_TYPES,
  plansForType,
  startingPremium,
  type InsuranceTypeId,
} from '@/lib/insurance';
import { formatINR } from '@/lib/format';
import { FONT, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function InsuranceCompareScreen() {
  const { type: typeParam } = useLocalSearchParams<{ type?: string }>();
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const typeId = (typeParam as InsuranceTypeId) || INSURANCE_TYPES[0].id;
  const type = getInsuranceType(typeId);
  const plans = type ? plansForType(type.id) : [];

  if (!type) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Compare cover" />
        <EmptyState
          title="Cover type not found"
          message="Pick a cover type from the insurance list."
          actionLabel="Back to insurance"
          onAction={() => router.navigate('/insurance')}
        />
      </SafeAreaView>
    );
  }

  const typeOptions = INSURANCE_TYPES.map((item) => ({ value: item.id, label: item.label }));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={`Compare ${type.label}`} />

      <ScrollView
        style={styles.verticalScroll}
        contentContainerStyle={styles.verticalContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.top}>
          <Text style={styles.intro}>Same cover type · different companies. Pick the plan that fits you.</Text>
          <FilterChips
            options={typeOptions}
            value={type.id}
            onChange={(value) => router.setParams({ type: value })}
          />
        </View>

        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator
          style={styles.horizontalScroll}
          contentContainerStyle={styles.scroller}
        >
          <View>
            <View style={styles.row}>
              <View style={[styles.corner, styles.cell]}>
                <Text style={styles.cornerText}>For {type.label}</Text>
              </View>
              {plans.map((plan) => {
                const company = getInsuranceCompany(plan.companyId);
                return (
                  <View key={plan.id} style={[styles.cell, styles.headerCell]}>
                    <Text style={styles.companyName}>{company?.name ?? 'Insurer'}</Text>
                    <Text style={styles.companyMeta}>{company ? `${company.rating.toFixed(1)} ★` : ''}</Text>
                    <Text style={styles.planName}>{plan.name}</Text>
                  </View>
                );
              })}
            </View>

            {type.compareRows.map((row) => (
              <View key={row.key} style={styles.row}>
                <View style={[styles.cell, styles.labelCell]}>
                  <Text style={styles.featureLabel}>{row.label}</Text>
                </View>
                {plans.map((plan) => {
                  const value = plan.features[row.key];
                  const ok = value === true;
                  return (
                    <View key={`${plan.id}-${row.key}`} style={styles.cell}>
                      {ok ? <Check size={18} color={theme.strong} /> : <Minus size={18} color={theme.muted} />}
                    </View>
                  );
                })}
              </View>
            ))}

            <View style={styles.row}>
              <View style={[styles.cell, styles.labelCell]}>
                <Text style={styles.featureLabel}>From / month</Text>
              </View>
              {plans.map((plan) => (
                <View key={`${plan.id}-price`} style={styles.cell}>
                  <Text style={styles.price}>{formatINR(startingPremium(plan))}</Text>
                </View>
              ))}
            </View>

            <View style={styles.row}>
              <View style={[styles.cell, styles.labelCell]}>
                <Text style={styles.featureLabel}>Choose</Text>
              </View>
              {plans.map((plan) => (
                <View key={`${plan.id}-cta`} style={[styles.cell, styles.ctaCell]}>
                  <Pressable
                    onPress={() => router.navigate(`/insurance/${plan.id}`)}
                    style={[styles.pickBtn, { backgroundColor: theme.strong }]}
                    accessibilityRole="button"
                  >
                    <Text style={styles.pickText}>View</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.disclaimer}>{INSURANCE_DISCLAIMER}</Text>
        <PrimaryButton label="Back to cover types" onPress={() => router.navigate('/insurance')} />
      </View>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    verticalScroll: { flex: 1 },
    verticalContent: { paddingBottom: 20, flexGrow: 1 },
    top: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 12 },
    intro: { fontFamily: FONT.regular, fontSize: 14, color: t.muted, lineHeight: 20 },
    horizontalScroll: { flexGrow: 0 },
    scroller: { paddingHorizontal: 16, paddingBottom: 8 },
    row: { flexDirection: 'row' },
    cell: {
      width: 140,
      minHeight: 64,
      padding: 12,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    corner: { width: 128, alignItems: 'flex-start' },
    cornerText: { fontFamily: FONT.bold, fontSize: 13, color: t.ink },
    headerCell: { backgroundColor: t.secondary, alignItems: 'flex-start' },
    labelCell: { width: 128, alignItems: 'flex-start', backgroundColor: t.background },
    companyName: { fontFamily: FONT.bold, fontSize: 14, color: t.ink },
    companyMeta: { fontFamily: FONT.regular, fontSize: 11, color: t.muted },
    planName: { fontFamily: FONT.semibold, fontSize: 12, color: t.ink, marginTop: 2 },
    featureLabel: { fontFamily: FONT.semibold, fontSize: 13, color: t.ink },
    price: { fontFamily: FONT.bold, fontSize: 14, color: t.strong },
    ctaCell: { paddingVertical: 10 },
    pickBtn: {
      minHeight: 36,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pickText: { fontFamily: FONT.bold, fontSize: 13, color: '#FFFFFF' },
    footer: { padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: t.border, backgroundColor: t.background },
    disclaimer: { fontFamily: FONT.regular, fontSize: 12, color: t.muted, lineHeight: 17 },
  });
}

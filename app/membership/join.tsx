import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/lib/AppContext';
import { formatINR } from '@/lib/format';
import { MEMBERSHIP_BENEFITS, MEMBERSHIP_DISCLAIMER, getMembershipPlan } from '@/lib/membership';
import { FONT, type Palette } from '@/lib/theme';

const PAY_DELAY_MS = 1600;

export default function MembershipJoinScreen() {
  const { plan: planParam } = useLocalSearchParams<{ plan?: string }>();
  const { theme, joinMembership } = useApp();
  const plan = getMembershipPlan(planParam ?? '');
  const [paying, setPaying] = useState(false);
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const pay = () => {
    if (!plan) return;
    setPaying(true);
    setTimeout(() => {
      joinMembership(plan.value);
      router.replace('/membership?joined=1');
    }, PAY_DELAY_MS);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Confirm membership" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {plan ? (
          <>
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>{plan.label} plan</Text>
              <Text style={styles.summaryPrice}>
                {formatINR(plan.price)}
                <Text style={styles.summaryPeriod}> {plan.period}</Text>
              </Text>
              <Text style={styles.summaryNote}>{plan.note}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What you get</Text>
              {MEMBERSHIP_BENEFITS.map((benefit) => (
                <Text key={benefit} style={styles.benefit}>
                  {benefit}
                </Text>
              ))}
            </View>

            <PrimaryButton
              label={`Pay ${formatINR(plan.price)} and join`}
              onPress={pay}
              loading={paying}
              disabled={paying}
            />
          </>
        ) : (
          <Text style={styles.error}>This membership plan could not be found. Go back and choose a plan again.</Text>
        )}
        <Text style={styles.disclaimer}>{MEMBERSHIP_DISCLAIMER}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingBottom: 32, gap: 24 },
    summary: { gap: 6, padding: 20, borderRadius: 20, backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
    summaryLabel: { fontFamily: FONT.bold, fontSize: 14, color: t.strong, textTransform: 'uppercase', letterSpacing: 0.5 },
    summaryPrice: { fontFamily: FONT.bold, fontSize: 28, color: t.ink },
    summaryPeriod: { fontFamily: FONT.regular, fontSize: 14, color: t.muted },
    summaryNote: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    section: { gap: 12 },
    sectionTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    benefit: { fontFamily: FONT.regular, fontSize: 14, color: t.ink, lineHeight: 21 },
    error: { fontFamily: FONT.regular, fontSize: 14, color: t.error, lineHeight: 21 },
    disclaimer: { fontFamily: FONT.regular, fontSize: 12, color: t.muted, lineHeight: 18 },
  });
}

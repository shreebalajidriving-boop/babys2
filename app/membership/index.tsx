import { router, useLocalSearchParams } from 'expo-router';
import { Check, CheckCircle2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from '@/components/Toast';
import { useApp } from '@/lib/AppContext';
import { formatINR, formatOrderDate } from '@/lib/format';
import { MEMBERSHIP_BENEFITS, MEMBERSHIP_DISCLAIMER, MEMBERSHIP_PLANS, renewalTimestamp } from '@/lib/membership';
import { FONT, type Palette } from '@/lib/theme';
import type { MembershipPlan } from '@/lib/types';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function MembershipScreen() {
  const { joined } = useLocalSearchParams<{ joined?: string }>();
  const { theme, membership } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Baby Bliss Club" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {membership ? (
          <MemberView plan={membership.plan} startedAt={membership.startedAt} joined={joined === '1'} />
        ) : (
          <JoinView />
        )}
        <Text style={styles.disclaimer}>{MEMBERSHIP_DISCLAIMER}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MemberView({ plan, startedAt, joined }: { plan: MembershipPlan; startedAt: number; joined: boolean }) {
  const { theme, cancelMembership } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const showToast = useToast();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const planInfo = MEMBERSHIP_PLANS.find((p) => p.value === plan);

  const cancel = () => {
    cancelMembership();
    setConfirmingCancel(false);
    showToast('Membership cancelled.');
  };

  return (
    <>
      {joined ? (
        <View style={[styles.banner, { backgroundColor: theme.secondary, borderColor: theme.strong }]}>
          <CheckCircle2 size={22} color={theme.strong} />
          <Text style={[styles.bannerText, { color: theme.ink }]}>Welcome to Baby Bliss Club.</Text>
        </View>
      ) : null}

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Your membership</Text>
        <Text style={styles.heroTitle}>{planInfo?.label} plan</Text>
        <Text style={styles.heroMeta}>
          Started {formatOrderDate(startedAt)}  |  Renews {formatOrderDate(renewalTimestamp(startedAt, plan))}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your benefits</Text>
        {MEMBERSHIP_BENEFITS.map((benefit) => (
          <BenefitRow key={benefit} text={benefit} styles={styles} theme={theme} />
        ))}
      </View>

      {confirmingCancel ? (
        <View style={[styles.confirm, { borderColor: theme.error, backgroundColor: theme.card }]}>
          <Text style={[styles.confirmTitle, { color: theme.ink }]}>Cancel your membership?</Text>
          <Text style={[styles.confirmBody, { color: theme.muted }]}>
            You will lose free delivery and member discounts on new orders.
          </Text>
          <PrimaryButton label="Yes, cancel membership" onPress={cancel} />
          <PrimaryButton label="Keep membership" variant="outline" onPress={() => setConfirmingCancel(false)} />
        </View>
      ) : (
        <PrimaryButton label="Cancel membership" variant="outline" onPress={() => setConfirmingCancel(true)} />
      )}
    </>
  );
}

function JoinView() {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [selected, setSelected] = useState<MembershipPlan>('yearly');

  return (
    <>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Baby Bliss Club</Text>
        <Text style={styles.heroTitle}>Free delivery and member savings, every order</Text>
        <Text style={styles.heroMeta}>Free delivery on every order, plus member savings on everything you buy.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose a plan</Text>
        {MEMBERSHIP_PLANS.map((plan) => {
          const active = plan.value === selected;
          return (
            <Pressable
              key={plan.value}
              onPress={() => setSelected(plan.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={[styles.planOption, { borderColor: active ? theme.strong : theme.border, backgroundColor: theme.card }]}
            >
              <View style={styles.planCopy}>
                <Text style={styles.planLabel}>{plan.label}</Text>
                <Text style={styles.planNote}>{plan.note}</Text>
              </View>
              <Text style={styles.planPrice}>
                {formatINR(plan.price)}
                <Text style={styles.planPeriod}> {plan.period}</Text>
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Benefits</Text>
        {MEMBERSHIP_BENEFITS.map((benefit) => (
          <BenefitRow key={benefit} text={benefit} styles={styles} theme={theme} />
        ))}
      </View>

      <PrimaryButton label="Continue" onPress={() => router.navigate(`/membership/join?plan=${selected}`)} />
    </>
  );
}

function BenefitRow({ text, styles, theme }: { text: string; styles: ReturnType<typeof makeStyles>; theme: Palette }) {
  return (
    <View style={styles.benefitRow}>
      <Check size={16} color={theme.strong} />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingBottom: 32, gap: 24 },
    banner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
    bannerText: { flex: 1, fontFamily: FONT.semibold, fontSize: 14 },
    hero: { gap: 6 },
    heroLabel: { fontFamily: FONT.bold, fontSize: 12, color: t.strong, textTransform: 'uppercase', letterSpacing: 0.5 },
    heroTitle: { fontFamily: FONT.bold, fontSize: 24, color: t.ink, lineHeight: 30 },
    heroMeta: { fontFamily: FONT.regular, fontSize: 14, color: t.muted, lineHeight: 21 },
    section: { gap: 12 },
    sectionTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    benefitText: { flex: 1, fontFamily: FONT.regular, fontSize: 14, color: t.ink, lineHeight: 21 },
    planOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderRadius: 18,
      borderWidth: 2,
    },
    planCopy: { gap: 2 },
    planLabel: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    planNote: { fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    planPrice: { fontFamily: FONT.bold, fontSize: 18, color: t.ink },
    planPeriod: { fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    confirm: { gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
    confirmTitle: { fontFamily: FONT.bold, fontSize: 15 },
    confirmBody: { fontFamily: FONT.regular, fontSize: 13 },
    disclaimer: { fontFamily: FONT.regular, fontSize: 12, color: t.muted, lineHeight: 18 },
  });
}

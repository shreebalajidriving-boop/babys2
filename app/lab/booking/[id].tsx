import { router, useLocalSearchParams } from 'expo-router';
import { Check, FileText } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { getLab, getLabTest } from '@/lib/labs';
import { formatINR, formatOrderDate } from '@/lib/format';
import { formatIsoDate } from '@/lib/schedule';
import { FONT, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';

const STAGES = ['Booking confirmed', 'Sample collected', 'Processing in lab', 'Report ready'];
// Simulated progress: minutes after booking when each stage unlocks.
const STAGE_MINUTES = [0, 1, 3, 6];

// Demo values only, shown so the report view has content to review.
const DEMO_RESULTS = [
  { label: 'Primary value', value: 'Within range', status: 'normal' },
  { label: 'Secondary value', value: 'Slightly low', status: 'watch' },
  { label: 'Reference check', value: 'Normal', status: 'normal' },
] as const;

export default function LabTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, labBookings, children } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [now, setNow] = useState(() => Date.now());
  const [showReport, setShowReport] = useState(false);
  const booking = labBookings.find((b) => b.id === id);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  if (!booking) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Lab booking" />
        <EmptyState title="Booking not found" message="We could not find this lab booking." actionLabel="Lab tests" onAction={() => router.navigate('/lab')} />
      </SafeAreaView>
    );
  }

  const test = getLabTest(booking.testId);
  const lab = getLab(booking.labId);
  const child = children.find((c) => c.id === booking.childId);
  const minutes = (now - booking.createdAt) / 60000;
  const stage = STAGE_MINUTES.reduce((acc, m, index) => (minutes >= m ? index : acc), 0);
  const ready = stage === STAGES.length - 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Track booking" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.testName}>{test?.name}</Text>
          <Text style={styles.meta}>{lab?.name}  |  {child?.name}</Text>
          <Text style={styles.meta}>
            Collection: {formatIsoDate(booking.date)}, {booking.slot}
          </Text>
          <Text style={styles.meta}>Address: {booking.address}</Text>
          <Text style={styles.meta}>Booked on {formatOrderDate(booking.createdAt)}  |  Paid {formatINR(booking.fee)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status</Text>
          {STAGES.map((label, index) => {
            const done = index <= stage;
            return (
              <View key={label} style={styles.step}>
                <View style={[styles.node, done && { backgroundColor: theme.strong, borderColor: theme.strong }]}>
                  {done ? <Check size={12} color="#FFFFFF" /> : null}
                </View>
                <Text style={[styles.stepText, !done && { color: theme.muted }]}>{label}</Text>
              </View>
            );
          })}
          <Text style={styles.note}>Status updates are simulated in this demo.</Text>
        </View>

        {showReport ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Report: {test?.name}</Text>
            {DEMO_RESULTS.map((row) => (
              <View key={row.label} style={styles.resultRow}>
                <Text style={styles.resultLabel}>{row.label}</Text>
                <Text style={[styles.resultValue, { color: row.status === 'watch' ? theme.warning : theme.success }]}>
                  {row.value}
                </Text>
              </View>
            ))}
            <Text style={styles.note}>Demo report only. Not a real medical result. Share it with your doctor for advice.</Text>
          </View>
        ) : null}

        {ready ? (
          <PrimaryButton
            label={showReport ? 'Hide report' : 'View report'}
            variant={showReport ? 'outline' : 'solid'}
            onPress={() => setShowReport((v) => !v)}
          />
        ) : (
          <View style={styles.pending}>
            <FileText size={18} color={theme.muted} />
            <Text style={styles.pendingText}>Your report will appear here once it is ready.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 16 },
    card: { padding: 16, borderRadius: 18, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, gap: 10 },
    testName: { fontFamily: FONT.bold, fontSize: 17, color: t.ink },
    meta: { fontFamily: FONT.regular, fontSize: 13, color: t.muted, lineHeight: 19 },
    cardTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    node: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: t.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepText: { fontFamily: FONT.semibold, fontSize: 14, color: t.ink },
    note: { fontFamily: FONT.regular, fontSize: 12, color: t.muted, lineHeight: 17 },
    resultRow: { flexDirection: 'row', justifyContent: 'space-between' },
    resultLabel: { fontFamily: FONT.regular, fontSize: 14, color: t.muted },
    resultValue: { fontFamily: FONT.bold, fontSize: 14 },
    pending: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 14,
      borderRadius: 14,
      backgroundColor: t.secondary,
    },
    pendingText: { flex: 1, fontFamily: FONT.semibold, fontSize: 13, color: t.ink },
  });
}

import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { getLabTest } from '@/lib/labs';
import { discountPercent, formatINR } from '@/lib/format';
import { FONT, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function LabTestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const test = getLabTest(id);

  if (!test) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Lab test" />
        <EmptyState title="Test not found" message="This test is no longer available." actionLabel="Back to lab tests" onAction={() => router.navigate('/lab')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Test details" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.category}>{test.category}</Text>
          <Text style={styles.name}>{test.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatINR(test.price)}</Text>
            <Text style={styles.mrp}>{formatINR(test.mrp)}</Text>
            <Text style={styles.off}>{discountPercent(test.mrp, test.price)}% off</Text>
          </View>
        </View>

        <Card title="About this test" styles={styles}>
          <Text style={styles.body}>{test.description}</Text>
        </Card>

        <Card title="Key facts" styles={styles}>
          <Fact label="Sample" value={test.sample} styles={styles} />
          <Fact label="Fasting needed" value={test.fasting ? 'Yes' : 'No'} styles={styles} />
          <Fact label="Report ready in" value={test.reportIn} styles={styles} />
        </Card>

        <Card title="How to prepare" styles={styles}>
          <Text style={styles.body}>{test.preparation}</Text>
        </Card>

        <PrimaryButton label="Book home collection" onPress={() => router.navigate(`/lab/book/${test.id}`)} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Card({ title, children, styles }: { title: string; children: React.ReactNode; styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Fact({ label, value, styles }: { label: string; value: string; styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 16 },
    hero: { gap: 6, padding: 18, borderRadius: 20, backgroundColor: t.secondary },
    category: { fontFamily: FONT.semibold, fontSize: 12, color: t.strong, textTransform: 'uppercase' },
    name: { fontFamily: FONT.bold, fontSize: 20, color: t.ink },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    price: { fontFamily: FONT.bold, fontSize: 18, color: t.ink },
    mrp: { fontFamily: FONT.regular, fontSize: 14, color: t.muted, textDecorationLine: 'line-through' },
    off: { fontFamily: FONT.semibold, fontSize: 13, color: t.success },
    card: { padding: 16, borderRadius: 18, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, gap: 10 },
    cardTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    body: { fontFamily: FONT.regular, fontSize: 14, color: t.ink, lineHeight: 21 },
    fact: { flexDirection: 'row', justifyContent: 'space-between' },
    factLabel: { fontFamily: FONT.regular, fontSize: 14, color: t.muted },
    factValue: { fontFamily: FONT.semibold, fontSize: 14, color: t.ink },
  });
}

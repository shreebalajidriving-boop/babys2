import { router, useLocalSearchParams } from 'expo-router';
import { ShieldCheck, Star } from 'lucide-react-native';
import { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { formatINR } from '@/lib/format';
import { getSitter, type Sitter } from '@/lib/sitters';
import { FONT, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function SitterProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sitter = getSitter(id);
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (!sitter) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Babysitter" />
        <EmptyState
          title="Sitter not found"
          message="Please choose a sitter again."
          actionLabel="Back to babysitters"
          onAction={() => router.navigate('/babysitting')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Babysitter" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SitterHero sitter={sitter} styles={styles} />

        <View style={styles.statRow}>
          <Stat label="Experience" value={`${sitter.experience} yrs`} styles={styles} />
          <Stat label="Rating" value={`${sitter.rating.toFixed(1)} (${sitter.reviews})`} styles={styles} />
          <Stat label="Per hour" value={formatINR(sitter.hourlyRate)} styles={styles} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.body}>{sitter.about}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comfortable with ages</Text>
          <View style={styles.chips}>
            {sitter.ageGroups.map((group) => (
              <View key={group} style={styles.chip}>
                <Text style={styles.chipText}>{group}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification</Text>
          <View style={styles.checkRow}>
            <ShieldCheck size={18} color={theme.success} />
            <Text style={styles.body}>Background verified and identity checked</Text>
          </View>
          <View style={styles.checkRow}>
            <ShieldCheck size={18} color={sitter.cprCertified ? theme.success : theme.muted} />
            <Text style={styles.body}>
              {sitter.cprCertified ? 'Certified in infant and child CPR' : 'CPR certification not yet on file'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <Text style={styles.body}>{sitter.languages.join(', ')}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={`Book a sitter at ${formatINR(sitter.hourlyRate)} / hour`}
          onPress={() => router.navigate(`/babysitting/book/${sitter.id}`)}
        />
      </View>
    </SafeAreaView>
  );
}

function SitterHero({ sitter, styles }: { sitter: Sitter; styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.hero}>
      <Image source={{ uri: sitter.image }} style={styles.heroImage} />
      <Text style={styles.name}>{sitter.name}</Text>
      <View style={styles.ratingRow}>
        <Star size={14} color="#D69E2E" fill="#D69E2E" />
        <Text style={styles.ratingText}>{sitter.rating.toFixed(1)} rating from {sitter.reviews} families</Text>
      </View>
    </View>
  );
}

function Stat({ label, value, styles }: { label: string; value: string; styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingBottom: 24, gap: 24 },
    hero: { alignItems: 'center', gap: 8 },
    heroImage: { width: 128, height: 128, borderRadius: 64, backgroundColor: t.secondary },
    name: { fontFamily: FONT.bold, fontSize: 22, color: t.ink, marginTop: 8 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    ratingText: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    statRow: { flexDirection: 'row', gap: 8 },
    stat: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 14,
      gap: 4,
      borderRadius: 16,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    statValue: { fontFamily: FONT.bold, fontSize: 14, color: t.ink },
    statLabel: { fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    section: { gap: 10 },
    sectionTitle: { fontFamily: FONT.bold, fontSize: 17, color: t.ink },
    body: { fontFamily: FONT.regular, fontSize: 14, color: t.ink, lineHeight: 21, flexShrink: 1 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: t.secondary },
    chipText: { fontFamily: FONT.semibold, fontSize: 12, color: t.strong },
    checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    footer: { paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: t.border, backgroundColor: t.card },
  });
}

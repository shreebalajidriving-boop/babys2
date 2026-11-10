import { router, useLocalSearchParams } from 'expo-router';
import { Clock, Globe, MapPin, Monitor, Star, Stethoscope } from 'lucide-react-native';
import { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { CONSULT_SLOTS, getDoctor } from '@/lib/doctors';
import { formatINR } from '@/lib/format';
import { dayOptions, openSlots } from '@/lib/schedule';
import { FONT, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function DoctorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, appointments } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const doctor = getDoctor(id);

  if (!doctor) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Doctor" />
        <EmptyState title="Doctor not found" message="This profile is no longer available." actionLabel="Back to Care" onAction={() => router.navigate('/care')} />
      </SafeAreaView>
    );
  }

  const bookedFor = (iso: string) =>
    appointments
      .filter((a) => a.status === 'confirmed' && a.doctorId === doctor.id && a.date === iso)
      .map((a) => a.time);

  const availability = dayOptions(3).map((day) => ({
    ...day,
    open: openSlots(CONSULT_SLOTS, doctor.id, day.iso, bookedFor(day.iso)).filter((s) => s.available).length,
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Doctor profile" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={{ uri: doctor.image }} style={styles.photo} />
          <Text style={styles.name}>{doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>
          <Text style={styles.qualification}>{doctor.qualification}</Text>
        </View>

        <View style={styles.stats}>
          <Stat label="Experience" value={`${doctor.experience} yrs`} styles={styles} />
          <Stat label="Rating" value={doctor.rating.toFixed(1)} icon={<Star size={13} color="#D69E2E" fill="#D69E2E" />} styles={styles} />
          <Stat label="Reviews" value={String(doctor.reviews)} styles={styles} />
        </View>

        <Card title="About" styles={styles}>
          <Text style={styles.body}>{doctor.about}</Text>
          <Row icon={<Globe size={16} color={theme.muted} />} text={doctor.languages.join(', ')} styles={styles} />
          <Row icon={<MapPin size={16} color={theme.muted} />} text={doctor.clinic} styles={styles} />
        </Card>

        <Card title="Consultation fees" styles={styles}>
          <FeeRow icon={<Monitor size={18} color={theme.strong} />} label="Online video consult" fee={doctor.onlineFee} styles={styles} />
          <View style={styles.divider} />
          <FeeRow icon={<Stethoscope size={18} color={theme.strong} />} label="Clinic visit" fee={doctor.offlineFee} styles={styles} />
        </Card>

        <Card title="Availability" styles={styles}>
          {availability.map((day) => (
            <Row
              key={day.iso}
              icon={<Clock size={16} color={theme.muted} />}
              text={`${day.weekday}, ${day.day} ${day.month}  |  ${day.open} slots open`}
              styles={styles}
            />
          ))}
        </Card>

        <View style={styles.footer}>
          <PrimaryButton label="Book online consult" onPress={() => router.navigate(`/book/${doctor.id}?mode=online`)} />
          <PrimaryButton label="Book clinic visit" variant="outline" onPress={() => router.navigate(`/book/${doctor.id}?mode=offline`)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  label,
  value,
  icon,
  styles,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.stat}>
      <View style={styles.statValue}>
        {icon}
        <Text style={styles.statNumber}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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

function Row({ icon, text, styles }: { icon: React.ReactNode; text: string; styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.row}>
      {icon}
      <Text style={styles.rowText}>{text}</Text>
    </View>
  );
}

function FeeRow({ icon, label, fee, styles }: { icon: React.ReactNode; label: string; fee: number; styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.feeRow}>
      <View style={styles.row}>
        {icon}
        <Text style={styles.rowText}>{label}</Text>
      </View>
      <Text style={styles.fee}>{formatINR(fee)}</Text>
    </View>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 16 },
    hero: { alignItems: 'center', gap: 4, paddingVertical: 8 },
    photo: { width: 112, height: 112, borderRadius: 56, backgroundColor: t.secondary, marginBottom: 8 },
    name: { fontFamily: FONT.bold, fontSize: 22, color: t.ink },
    specialty: { fontFamily: FONT.semibold, fontSize: 15, color: t.strong },
    qualification: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    stats: {
      flexDirection: 'row',
      padding: 16,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    stat: { flex: 1, alignItems: 'center', gap: 4 },
    statValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statNumber: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    statLabel: { fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    card: {
      padding: 16,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      gap: 12,
    },
    cardTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    body: { fontFamily: FONT.regular, fontSize: 14, color: t.ink, lineHeight: 21 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
    rowText: { fontFamily: FONT.regular, fontSize: 14, color: t.ink, flexShrink: 1 },
    feeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    fee: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    divider: { height: 1, backgroundColor: t.border },
    footer: { gap: 12 },
  });
}

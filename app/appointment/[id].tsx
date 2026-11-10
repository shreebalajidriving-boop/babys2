import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { getDoctor } from '@/lib/doctors';
import { formatINR } from '@/lib/format';
import { formatIsoDate } from '@/lib/schedule';
import { FONT, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useToast } from '@/components/Toast';

const PAYMENT_LABEL = { upi: 'UPI', card: 'Credit or debit card', cod: 'Pay at clinic' } as const;

export default function AppointmentScreen() {
  const { id, booked } = useLocalSearchParams<{ id: string; booked?: string }>();
  const { theme, appointments, children, cancelAppointment } = useApp();
  const toast = useToast();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const appointment = appointments.find((a) => a.id === id);

  if (!appointment) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Appointment" />
        <EmptyState title="Appointment not found" message="We could not find this appointment." actionLabel="Go to Care" onAction={() => router.navigate('/care')} />
      </SafeAreaView>
    );
  }

  const doctor = getDoctor(appointment.doctorId);
  const child = children.find((c) => c.id === appointment.childId);
  const cancelled = appointment.status === 'cancelled';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Appointment" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {booked === '1' && !cancelled ? (
          <View style={styles.success}>
            <CheckCircle2 size={22} color={theme.success} />
            <Text style={styles.successText}>Payment received and your appointment is confirmed.</Text>
          </View>
        ) : null}

        {cancelled ? (
          <View style={styles.cancelledBanner}>
            <Text style={styles.cancelledText}>This appointment has been cancelled.</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.label}>Doctor</Text>
          <Text style={styles.doctorName}>{doctor?.name ?? 'Doctor'}</Text>
          <Text style={styles.meta}>{doctor?.specialty}  |  {doctor?.clinic}</Text>
        </View>

        <View style={styles.card}>
          <Detail label="Date" value={formatIsoDate(appointment.date)} styles={styles} />
          <Detail label="Time" value={appointment.time} styles={styles} />
          <Detail label="Type" value={appointment.mode === 'online' ? 'Online video consult' : 'Clinic visit'} styles={styles} />
          <Detail label="Patient" value={child?.name ?? '-'} styles={styles} />
          <Detail label="Reason" value={appointment.reason} styles={styles} />
          <View style={styles.divider} />
          <Detail label="Fee paid" value={formatINR(appointment.fee)} styles={styles} bold />
          <Detail label="Payment" value={PAYMENT_LABEL[appointment.payment]} styles={styles} />
          <Detail label="Booking ID" value={appointment.id} styles={styles} />
        </View>

        {!cancelled && appointment.mode === 'online' ? (
          <PrimaryButton label="Join video consultation" onPress={() => router.navigate(`/consult/${appointment.id}`)} />
        ) : null}

        {!cancelled ? (
          confirmCancel ? (
            <View style={styles.card}>
              <Text style={styles.cancelTitle}>Cancel this appointment?</Text>
              <Text style={styles.meta}>You can book a new time slot at any point.</Text>
              <View style={styles.actions}>
                <View style={styles.action}>
                  <PrimaryButton label="Keep it" variant="outline" onPress={() => setConfirmCancel(false)} />
                </View>
                <View style={styles.action}>
                  <PrimaryButton
                    label="Cancel visit"
                    onPress={() => {
                      cancelAppointment(appointment.id);
                      setConfirmCancel(false);
                      toast('Appointment cancelled');
                    }}
                  />
                </View>
              </View>
            </View>
          ) : (
            <PrimaryButton label="Cancel appointment" variant="outline" onPress={() => setConfirmCancel(true)} />
          )
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Detail({
  label,
  value,
  styles,
  bold,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof makeStyles>;
  bold?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, bold && { fontFamily: FONT.bold }]}>{value}</Text>
    </View>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 16 },
    success: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 16,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.success,
    },
    successText: { flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink },
    cancelledBanner: { padding: 14, borderRadius: 16, backgroundColor: t.card, borderWidth: 1, borderColor: t.error },
    cancelledText: { fontFamily: FONT.semibold, fontSize: 14, color: t.error },
    card: {
      padding: 16,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      gap: 12,
    },
    label: { fontFamily: FONT.semibold, fontSize: 12, color: t.muted, textTransform: 'uppercase' },
    doctorName: { fontFamily: FONT.bold, fontSize: 18, color: t.ink },
    meta: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    detailLabel: { fontFamily: FONT.regular, fontSize: 14, color: t.muted },
    detailValue: { flexShrink: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink, textAlign: 'right' },
    divider: { height: 1, backgroundColor: t.border },
    cancelTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
    action: { flex: 1 },
  });
}

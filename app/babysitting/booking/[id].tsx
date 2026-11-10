import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, XCircle } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from '@/components/Toast';
import { useApp } from '@/lib/AppContext';
import { formatINR } from '@/lib/format';
import { formatIsoDate } from '@/lib/schedule';
import { endTimeFor, getSitter } from '@/lib/sitters';
import { FONT, type Palette } from '@/lib/theme';
import type { PaymentMethod } from '@/lib/types';
import { FormSection, SummaryRow } from '@/components/BookingSteps';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  upi: 'UPI',
  card: 'Credit or debit card',
  cod: 'Pay at clinic',
};

export default function SitterBookingScreen() {
  const { id, booked } = useLocalSearchParams<{ id: string; booked?: string }>();
  const { theme, sitterBookings, children, cancelSitterBooking } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const toast = useToast();
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const booking = sitterBookings.find((b) => b.id === id);
  const sitter = booking ? getSitter(booking.sitterId) : undefined;

  if (!booking || !sitter) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Booking" />
        <EmptyState
          title="Booking not found"
          message="This babysitting booking could not be found."
          actionLabel="My bookings"
          onAction={() => router.navigate('/bookings')}
        />
      </SafeAreaView>
    );
  }

  const cancelled = booking.status === 'cancelled';
  const childName = children.find((c) => c.id === booking.childId)?.name ?? '-';

  const cancelBooking = () => {
    cancelSitterBooking(booking.id);
    setConfirmingCancel(false);
    toast('Booking cancelled.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Babysitting booking" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {cancelled ? (
          <View style={[styles.banner, { backgroundColor: theme.card, borderColor: theme.error }]}>
            <XCircle size={22} color={theme.error} />
            <Text style={[styles.bannerText, { color: theme.ink }]}>This booking was cancelled.</Text>
          </View>
        ) : booked === '1' ? (
          <View style={[styles.banner, { backgroundColor: theme.secondary, borderColor: theme.strong }]}>
            <CheckCircle2 size={22} color={theme.strong} />
            <Text style={[styles.bannerText, { color: theme.ink }]}>Booking confirmed. {sitter.name} is booked.</Text>
          </View>
        ) : null}

        <View style={styles.sitterCard}>
          <Text style={styles.sitterName}>{sitter.name}</Text>
          <Text style={styles.sitterMeta}>Booking {booking.id}</Text>
        </View>

        <FormSection title="Visit details">
          <SummaryRow label="Date" value={formatIsoDate(booking.date)} />
          <SummaryRow label="Time" value={`${booking.startTime} to ${endTimeFor(booking.startTime, booking.hours)}`} />
          <SummaryRow label="Duration" value={`${booking.hours} hours`} />
          <SummaryRow label="Child" value={childName} />
          <SummaryRow label="Address" value={booking.address} />
          <SummaryRow label="Help with" value={booking.requirements.length ? booking.requirements.join(', ') : 'General care'} />
          <SummaryRow label="Notes" value={booking.notes || '-'} />
        </FormSection>

        <FormSection title="Payment">
          <SummaryRow label="Paid by" value={PAYMENT_LABEL[booking.payment]} />
          <SummaryRow label="Total" value={formatINR(booking.total)} bold />
        </FormSection>

        {!cancelled ? (
          <View style={styles.actions}>
            <PrimaryButton label="View sitter profile" variant="outline" onPress={() => router.navigate(`/babysitting/${sitter.id}`)} />
            {confirmingCancel ? (
              <View style={[styles.confirm, { borderColor: theme.error, backgroundColor: theme.card }]}>
                <Text style={[styles.confirmTitle, { color: theme.ink }]}>Cancel this booking?</Text>
                <Text style={[styles.confirmBody, { color: theme.muted }]}>
                  You can book this sitter again at any time.
                </Text>
                <PrimaryButton label="Yes, cancel booking" onPress={cancelBooking} />
                <PrimaryButton label="Keep booking" variant="outline" onPress={() => setConfirmingCancel(false)} />
              </View>
            ) : (
              <PrimaryButton label="Cancel booking" variant="outline" onPress={() => setConfirmingCancel(true)} />
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 20 },
    banner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
    bannerText: { flex: 1, fontFamily: FONT.semibold, fontSize: 14 },
    sitterCard: { padding: 14, borderRadius: 16, backgroundColor: t.secondary, gap: 2 },
    sitterName: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    sitterMeta: { fontFamily: FONT.regular, fontSize: 13, color: t.ink },
    actions: { gap: 12 },
    confirm: { gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
    confirmTitle: { fontFamily: FONT.bold, fontSize: 15 },
    confirmBody: { fontFamily: FONT.regular, fontSize: 13 },
  });
}

import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, Home, Hospital } from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/lib/AppContext';
import { formatINR, formatOrderDate } from '@/lib/format';
import { formatIsoDate } from '@/lib/schedule';
import { FONT, type Palette } from '@/lib/theme';
import { VACCINES } from '@/lib/vaccines';

const PAYMENT_LABEL: Record<string, string> = {
  upi: 'UPI',
  card: 'Card',
  cod: 'Pay at visit',
};

export default function VaccineThanksScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, vaccineBookings, children } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const booking = (vaccineBookings ?? []).find((b) => b.id === id);

  if (!booking) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Vaccination booking" />
        <EmptyState
          title="Booking not found"
          message="We could not find this vaccination booking."
          actionLabel="Back to vaccines"
          onAction={() => router.navigate('/vaccines')}
        />
      </SafeAreaView>
    );
  }

  const vaccine = VACCINES.find((v) => v.id === booking.vaccineId);
  const child = children.find((c) => c.id === booking.childId);
  const PlaceIcon = booking.place === 'clinic' ? Hospital : Home;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Booking confirmed" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.thanksCard}>
          <View style={[styles.iconWrap, { backgroundColor: theme.secondary }]}>
            <CheckCircle2 size={36} color={theme.strong} />
          </View>
          <Text style={styles.thanksTitle}>Thank you</Text>
          <Text style={styles.thanksBody}>
            Your vaccination visit is booked. We will remind you before the appointment.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{vaccine?.name ?? 'Vaccine'}</Text>
          <Text style={styles.meta}>For {child?.name ?? 'your child'}</Text>
          <View style={styles.placeRow}>
            <PlaceIcon size={16} color={theme.strong} />
            <Text style={styles.meta}>
              {booking.place === 'clinic' ? 'Clinic visit' : 'Nurse at home'}
            </Text>
          </View>
          <Text style={styles.meta}>
            {formatIsoDate(booking.date)} at {booking.time || 'Time TBD'}
          </Text>
          <Text style={styles.meta}>Booking ID {booking.id}</Text>
          <Text style={styles.meta}>Booked on {formatOrderDate(booking.createdAt)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <View style={styles.payRow}>
            <Text style={styles.meta}>{PAYMENT_LABEL[booking.payment] ?? booking.payment ?? 'UPI'}</Text>
            <Text style={styles.fee}>{formatINR(booking.fee ?? (booking.place === 'home' ? 799 : 499))}</Text>
          </View>
          <Text style={styles.note}>
            {booking.payment === 'cod'
              ? 'Pay the visit fee when the nurse or clinic completes the shot.'
              : 'Payment received. A receipt is saved with this booking.'}
          </Text>
        </View>

        <PrimaryButton label="Back to vaccines" onPress={() => router.navigate('/vaccines')} />
        <PrimaryButton label="Go home" variant="outline" onPress={() => router.navigate('/')} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },
    thanksCard: {
      alignItems: 'center',
      gap: 10,
      paddingVertical: 28,
      paddingHorizontal: 20,
      borderRadius: 20,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    iconWrap: {
      width: 68,
      height: 68,
      borderRadius: 34,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    thanksTitle: { fontFamily: FONT.bold, fontSize: 24, color: t.ink },
    thanksBody: {
      fontFamily: FONT.regular,
      fontSize: 14,
      color: t.muted,
      lineHeight: 21,
      textAlign: 'center',
    },
    card: {
      padding: 18,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      gap: 8,
    },
    cardTitle: { fontFamily: FONT.bold, fontSize: 17, color: t.ink },
    meta: { fontFamily: FONT.regular, fontSize: 14, color: t.muted, lineHeight: 20 },
    placeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    payRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    fee: { fontFamily: FONT.bold, fontSize: 18, color: t.ink },
    note: { fontFamily: FONT.regular, fontSize: 12, color: t.muted, lineHeight: 18, marginTop: 4 },
  });
}

import { router } from 'expo-router';
import { Banknote, Check, CreditCard, MapPin, Smartphone } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { formatINR } from '@/lib/format';
import { computeTotals } from '@/lib/pricing';
import { FONT, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { PaymentMethod } from '@/lib/types';

const SLOTS = ['Today, 6-9 PM', 'Tomorrow, 8-11 AM', 'Tomorrow, 4-7 PM', 'Sunday, 9 AM-12 PM'];
const PAYMENTS: { value: PaymentMethod; label: string; detail: string; icon: typeof Smartphone }[] = [
  { value: 'upi', label: 'UPI', detail: 'Pay with any UPI app', icon: Smartphone },
  { value: 'card', label: 'Credit or debit card', detail: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { value: 'cod', label: 'Cash on delivery', detail: 'Pay when your order arrives', icon: Banknote },
];
const PAYMENT_DELAY_MS = 1800;

export default function CheckoutScreen() {
  const { theme, cart, coupon, addresses, parent, addAddress, placeOrder, membership } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [addressId, setAddressId] = useState<string | null>(addresses[0]?.id ?? null);
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [slot, setSlot] = useState(SLOTS[1]);
  const [payment, setPayment] = useState<PaymentMethod>('upi');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const totals = computeTotals(cart, coupon, membership !== null);

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Checkout" />
        <EmptyState title="Nothing to check out" message="Your cart is empty." actionLabel="Go to shop" onAction={() => router.navigate('/shop')} />
      </SafeAreaView>
    );
  }

  const pay = () => {
    const address = addresses.find((a) => a.id === addressId);
    if (!address) {
      setError('Choose a delivery address to continue.');
      return;
    }
    setError(null);
    setProcessing(true);
    timer.current = setTimeout(() => {
      const orderId = placeOrder({
        items: cart,
        subtotal: totals.subtotal,
        discount: totals.discount,
        delivery: totals.delivery,
        total: totals.total,
        address,
        slot,
        payment,
      });
      router.replace(`/order/${orderId}`);
    }, PAYMENT_DELAY_MS);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Checkout" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Section title="Delivery address">
          {addresses.map((address) => {
            const active = address.id === addressId;
            return (
              <Pressable
                key={address.id}
                onPress={() => setAddressId(address.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.option, active && { borderColor: theme.strong, backgroundColor: theme.secondary }]}
              >
                <MapPin size={18} color={theme.strong} />
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{address.label}</Text>
                  <Text style={styles.optionBody}>
                    {address.line}, {address.city} {address.pincode}
                  </Text>
                </View>
                {active ? <Check size={18} color={theme.strong} /> : null}
              </Pressable>
            );
          })}

          {showForm ? (
            <AddressForm
              defaultCity={parent?.city ?? ''}
              onSave={(address) => {
                setAddressId(addAddress(address));
                setShowForm(false);
              }}
              onCancel={addresses.length > 0 ? () => setShowForm(false) : undefined}
            />
          ) : (
            <Pressable onPress={() => setShowForm(true)} style={styles.addLink} accessibilityRole="button">
              <Text style={styles.addLinkText}>+ Add new address</Text>
            </Pressable>
          )}
        </Section>

        <Section title="Delivery slot">
          <View style={styles.chips}>
            {SLOTS.map((option) => {
              const active = option === slot;
              return (
                <Pressable
                  key={option}
                  onPress={() => setSlot(option)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[styles.chip, active && { borderColor: theme.strong, backgroundColor: theme.secondary }]}
                >
                  <Text style={[styles.chipText, active && { color: theme.strong }]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Payment method">
          {PAYMENTS.map((option) => {
            const active = option.value === payment;
            const Icon = option.icon;
            return (
              <Pressable
                key={option.value}
                onPress={() => setPayment(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.option, active && { borderColor: theme.strong, backgroundColor: theme.secondary }]}
              >
                <Icon size={18} color={theme.strong} />
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{option.label}</Text>
                  <Text style={styles.optionBody}>{option.detail}</Text>
                </View>
                {active ? <Check size={18} color={theme.strong} /> : null}
              </Pressable>
            );
          })}
        </Section>

        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {cart.reduce((sum, item) => sum + item.qty, 0)} items · Delivery {totals.delivery === 0 ? 'free' : formatINR(totals.delivery)}
            {totals.discount > 0 ? ` · Saved ${formatINR(totals.discount)}` : ''}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {processing ? <Text style={styles.processing}>Processing your payment...</Text> : null}
        <PrimaryButton
          label={`Pay ${formatINR(totals.total)}`}
          onPress={pay}
          loading={processing}
          disabled={processing}
        />
        <Text style={styles.demo}>Demo checkout: no real payment is taken.</Text>
      </View>
    </SafeAreaView>
  );
}

function AddressForm({
  defaultCity,
  onSave,
  onCancel,
}: {
  defaultCity: string;
  onSave: (address: { label: string; line: string; city: string; pincode: string }) => void;
  onCancel?: () => void;
}) {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [label, setLabel] = useState('Home');
  const [line, setLine] = useState('');
  const [city, setCity] = useState(defaultCity);
  const [pincode, setPincode] = useState('');
  const [errors, setErrors] = useState<{ line?: string; city?: string; pincode?: string }>({});

  const save = () => {
    const nextErrors = {
      line: line.trim().length >= 8 ? undefined : 'Enter your house number, street and area.',
      city: city.trim() ? undefined : 'Enter your city.',
      pincode: /^\d{6}$/.test(pincode) ? undefined : 'Enter a valid 6-digit pincode.',
    };
    setErrors(nextErrors);
    if (nextErrors.line || nextErrors.city || nextErrors.pincode) return;
    onSave({ label, line: line.trim(), city: city.trim(), pincode });
  };

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>New address</Text>
      <View style={styles.chips}>
        {['Home', 'Work', 'Other'].map((option) => {
          const active = label === option;
          return (
            <Pressable
              key={option}
              onPress={() => setLabel(option)}
              style={[styles.chip, active && { borderColor: theme.strong, backgroundColor: theme.secondary }]}
            >
              <Text style={[styles.chipText, active && { color: theme.strong }]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
      <TextInput
        value={line}
        onChangeText={setLine}
        placeholder="Flat, house number, street, area"
        placeholderTextColor={theme.muted}
        style={[styles.input, styles.multiline]}
        multiline
        maxLength={160}
      />
      {errors.line ? <Text style={styles.error}>{errors.line}</Text> : null}
      <View style={styles.inlineRow}>
        <View style={styles.inlineField}>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="City"
            placeholderTextColor={theme.muted}
            style={styles.input}
            maxLength={40}
          />
          {errors.city ? <Text style={styles.error}>{errors.city}</Text> : null}
        </View>
        <View style={styles.inlineField}>
          <TextInput
            value={pincode}
            onChangeText={(v) => setPincode(v.replace(/\D/g, '').slice(0, 6))}
            placeholder="Pincode"
            placeholderTextColor={theme.muted}
            keyboardType="number-pad"
            style={styles.input}
            maxLength={6}
          />
          {errors.pincode ? <Text style={styles.error}>{errors.pincode}</Text> : null}
        </View>
      </View>
      <View style={styles.formActions}>
        {onCancel ? (
          <Pressable onPress={onCancel} style={styles.cancel} accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        ) : null}
        <View style={styles.saveWrap}>
          <PrimaryButton label="Save address" onPress={save} />
        </View>
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 20 },
    section: { gap: 10 },
    sectionTitle: { fontFamily: FONT.bold, fontSize: 17, color: t.ink, marginBottom: 2 },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
    },
    optionCopy: { flex: 1, gap: 2 },
    optionTitle: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    optionBody: { fontFamily: FONT.regular, fontSize: 13, color: t.muted, lineHeight: 18 },
    addLink: { paddingVertical: 8, alignSelf: 'flex-start' },
    addLinkText: { fontFamily: FONT.bold, fontSize: 15, color: t.strong },
    form: {
      gap: 12,
      padding: 16,
      borderRadius: 16,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    formTitle: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    input: {
      minHeight: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.background,
      paddingHorizontal: 14,
      fontFamily: FONT.regular,
      fontSize: 15,
      color: t.ink,
    },
    multiline: { minHeight: 72, textAlignVertical: 'top', paddingTop: 12 },
    inlineRow: { flexDirection: 'row', gap: 10 },
    inlineField: { flex: 1, gap: 6 },
    formActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cancel: { paddingHorizontal: 8, paddingVertical: 12 },
    cancelText: { fontFamily: FONT.bold, fontSize: 15, color: t.muted },
    saveWrap: { flex: 1 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingHorizontal: 14,
      minHeight: 40,
      justifyContent: 'center',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
    },
    chipText: { fontFamily: FONT.semibold, fontSize: 14, color: t.ink },
    summary: {
      padding: 14,
      borderRadius: 14,
      backgroundColor: t.secondary,
    },
    summaryText: { fontFamily: FONT.semibold, fontSize: 14, color: t.ink, textAlign: 'center' },
    footer: {
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 12,
      backgroundColor: t.card,
      borderTopWidth: 1,
      borderTopColor: t.border,
    },
    error: { fontFamily: FONT.semibold, fontSize: 13, color: t.error },
    processing: { fontFamily: FONT.semibold, fontSize: 14, color: t.strong, textAlign: 'center' },
    demo: { fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: 'center' },
  });
}

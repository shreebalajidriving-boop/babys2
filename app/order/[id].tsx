import { router, useLocalSearchParams } from 'expo-router';
import { Check, Package } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { getProduct } from '@/lib/catalog';
import { formatINR, formatOrderDate } from '@/lib/format';
import { FONT, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';

const STAGES = [
  { title: 'Order confirmed', detail: 'We have received your order and payment.' },
  { title: 'Packed', detail: 'Your items are checked and packed with care.' },
  { title: 'Out for delivery', detail: 'Your delivery partner is on the way.' },
  { title: 'Delivered', detail: 'Enjoy your purchase.' },
];

// Simulated progress: each stage unlocks after a fixed number of minutes.
const STAGE_MINUTES = [0, 1, 3, 6];

function stageFor(createdAt: number, now: number) {
  const elapsed = (now - createdAt) / 60000;
  let stage = 0;
  STAGE_MINUTES.forEach((minutes, index) => {
    if (elapsed >= minutes) stage = index;
  });
  return stage;
}

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, orders } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const order = orders.find((o) => o.id === id);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  if (!order) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Order" />
        <EmptyState title="Order not found" message="We could not find this order in your account." actionLabel="Go to shop" onAction={() => router.navigate('/shop')} />
      </SafeAreaView>
    );
  }

  const stage = stageFor(order.createdAt, now);
  const delivered = stage === STAGES.length - 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Order details" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: theme.strong }]}>
            {delivered ? <Check size={28} color="#FFFFFF" /> : <Package size={28} color="#FFFFFF" />}
          </View>
          <Text style={styles.heroTitle}>{STAGES[stage].title}</Text>
          <Text style={styles.heroBody}>{STAGES[stage].detail}</Text>
          <Text style={styles.orderId}>Order {order.id} · {formatOrderDate(order.createdAt)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tracking</Text>
          {STAGES.map((item, index) => {
            const done = index <= stage;
            const last = index === STAGES.length - 1;
            return (
              <View key={item.title} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View style={[styles.node, done && { backgroundColor: theme.strong, borderColor: theme.strong }]}>
                    {done ? <Check size={12} color="#FFFFFF" /> : null}
                  </View>
                  {!last ? <View style={[styles.line, index < stage && { backgroundColor: theme.strong }]} /> : null}
                </View>
                <View style={styles.timelineCopy}>
                  <Text style={[styles.stepTitle, !done && { color: theme.muted }]}>{item.title}</Text>
                  <Text style={styles.stepDetail}>{item.detail}</Text>
                </View>
              </View>
            );
          })}
          <Text style={styles.note}>Tracking updates are simulated in this demo.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          {order.items.map((item) => {
            const product = getProduct(item.productId);
            if (!product) return null;
            return (
              <View key={item.key} style={styles.item}>
                <Image source={{ uri: product.image }} style={styles.thumb} resizeMode="cover" />
                <View style={styles.itemCopy}>
                  <Text style={styles.itemName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.itemMeta}>{item.variant} · Qty {item.qty}</Text>
                  <Text style={styles.itemPrice}>{formatINR(product.price * item.qty)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery</Text>
          <Text style={styles.body}>{order.address.line}, {order.address.city} {order.address.pincode}</Text>
          <Text style={styles.body}>Slot: {order.slot}</Text>
          <Text style={styles.body}>Payment: {PAYMENT_LABEL[order.payment]}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill</Text>
          <Line label="Subtotal" value={formatINR(order.subtotal)} styles={styles} />
          {order.discount > 0 ? <Line label="Discount" value={`-${formatINR(order.discount)}`} styles={styles} /> : null}
          <Line label="Delivery" value={order.delivery === 0 ? 'Free' : formatINR(order.delivery)} styles={styles} />
          <View style={styles.divider} />
          <Line label="Total paid" value={formatINR(order.total)} styles={styles} bold />
        </View>

        <PrimaryButton label="Continue shopping" variant="outline" onPress={() => router.navigate('/shop')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const PAYMENT_LABEL = { upi: 'UPI', card: 'Card', cod: 'Cash on delivery' } as const;

function Line({
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
    <View style={styles.line2}>
      <Text style={[styles.lineLabel, bold && styles.boldText]}>{label}</Text>
      <Text style={[styles.lineValue, bold && styles.boldText]}>{value}</Text>
    </View>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 16 },
    hero: { alignItems: 'center', gap: 6, paddingVertical: 12 },
    heroIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
    heroTitle: { fontFamily: FONT.bold, fontSize: 22, color: t.ink },
    heroBody: { fontFamily: FONT.regular, fontSize: 15, color: t.muted, textAlign: 'center' },
    orderId: { fontFamily: FONT.semibold, fontSize: 13, color: t.muted, marginTop: 4 },
    card: {
      padding: 16,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      gap: 12,
    },
    cardTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    timelineRow: { flexDirection: 'row', gap: 12 },
    timelineRail: { alignItems: 'center', width: 20 },
    node: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: t.border,
      backgroundColor: t.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    line: { flex: 1, width: 2, minHeight: 28, backgroundColor: t.border, marginVertical: 2 },
    timelineCopy: { flex: 1, gap: 2, paddingBottom: 14 },
    stepTitle: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    stepDetail: { fontFamily: FONT.regular, fontSize: 13, color: t.muted, lineHeight: 18 },
    note: { fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    item: { flexDirection: 'row', gap: 12 },
    thumb: { width: 60, height: 60, borderRadius: 12, backgroundColor: t.secondary },
    itemCopy: { flex: 1, gap: 2 },
    itemName: { fontFamily: FONT.semibold, fontSize: 14, color: t.ink },
    itemMeta: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    itemPrice: { fontFamily: FONT.bold, fontSize: 14, color: t.ink },
    body: { fontFamily: FONT.regular, fontSize: 14, color: t.ink, lineHeight: 20 },
    line2: { flexDirection: 'row', justifyContent: 'space-between' },
    lineLabel: { fontFamily: FONT.regular, fontSize: 15, color: t.muted },
    lineValue: { fontFamily: FONT.semibold, fontSize: 15, color: t.ink },
    boldText: { fontFamily: FONT.bold, color: t.ink, fontSize: 16 },
    divider: { height: 1, backgroundColor: t.border },
  });
}

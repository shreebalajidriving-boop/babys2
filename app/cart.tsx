import { router } from 'expo-router';
import { Minus, Plus, ShoppingBag, Tag, Trash2, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { getProduct } from '@/lib/catalog';
import { formatINR } from '@/lib/format';
import { COUPON_HINT, computeTotals } from '@/lib/pricing';
import { FONT, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useToast } from '@/components/Toast';

export default function CartScreen() {
  const { theme, cart, coupon, setCartQty, removeFromCart, applyCoupon, removeCoupon, membership } = useApp();
  const toast = useToast();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [code, setCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const totals = computeTotals(cart, coupon, membership !== null);

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="My cart" />
        <EmptyState
          icon={<ShoppingBag size={30} color={theme.strong} />}
          title="Your cart is empty"
          message="Add diapers, feeding essentials or toys and they will wait for you here."
          actionLabel="Start shopping"
          onAction={() => router.navigate('/shop')}
        />
      </SafeAreaView>
    );
  }

  const handleApply = () => {
    const error = applyCoupon(code);
    if (error) {
      setCouponError(error);
      return;
    }
    setCouponError(null);
    setCode('');
    toast('Coupon applied');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={`My cart (${cart.reduce((sum, item) => sum + item.qty, 0)})`} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {cart.map((item) => {
          const product = getProduct(item.productId);
          if (!product) return null;
          return (
            <View key={item.key} style={styles.item}>
              <Image source={{ uri: product.image }} style={styles.thumb} resizeMode="cover" />
              <View style={styles.itemCopy}>
                <Text style={styles.brand}>{product.brand}</Text>
                <Text style={styles.name} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.variant}>{item.variant}</Text>
                <View style={styles.itemFooter}>
                  <View style={styles.stepper}>
                    <Pressable
                      onPress={() => setCartQty(item.key, item.qty - 1)}
                      disabled={item.qty <= 1}
                      style={[styles.stepBtn, item.qty <= 1 && styles.stepDisabled]}
                      accessibilityLabel="Decrease quantity"
                    >
                      <Minus size={16} color={theme.ink} />
                    </Pressable>
                    <Text style={styles.qty}>{item.qty}</Text>
                    <Pressable
                      onPress={() => setCartQty(item.key, item.qty + 1)}
                      style={styles.stepBtn}
                      accessibilityLabel="Increase quantity"
                    >
                      <Plus size={16} color={theme.ink} />
                    </Pressable>
                  </View>
                  <Text style={styles.lineTotal}>{formatINR(product.price * item.qty)}</Text>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  removeFromCart(item.key);
                  toast(`${product.name} removed`);
                }}
                hitSlop={8}
                style={styles.remove}
                accessibilityLabel="Remove item"
              >
                <Trash2 size={18} color={theme.error} />
              </Pressable>
            </View>
          );
        })}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Coupon</Text>
          {totals.couponApplied ? (
            <View style={[styles.appliedRow, { backgroundColor: theme.secondary }]}>
              <Tag size={16} color={theme.strong} />
              <Text style={styles.appliedText}>{totals.couponApplied} applied</Text>
              <Pressable
                onPress={() => {
                  removeCoupon();
                  toast('Coupon removed');
                }}
                hitSlop={8}
                accessibilityLabel="Remove coupon"
              >
                <X size={18} color={theme.ink} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.couponRow}>
              <TextInput
                value={code}
                onChangeText={(v) => {
                  setCode(v.toUpperCase());
                  setCouponError(null);
                }}
                placeholder="Enter coupon code"
                placeholderTextColor={theme.muted}
                autoCapitalize="characters"
                style={styles.couponInput}
                maxLength={20}
              />
              <Pressable
                onPress={handleApply}
                disabled={!code.trim()}
                style={[styles.applyButton, !code.trim() && styles.disabled]}
                accessibilityRole="button"
              >
                <Text style={styles.applyText}>Apply</Text>
              </Pressable>
            </View>
          )}
          {couponError ? <Text style={styles.error}>{couponError}</Text> : null}
          {totals.couponError && !couponError ? <Text style={styles.error}>{totals.couponError}</Text> : null}
          {!totals.couponApplied ? <Text style={styles.hint}>{COUPON_HINT}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill details</Text>
          <Row label="Subtotal" value={formatINR(totals.subtotal)} styles={styles} />
          {totals.couponDiscount > 0 ? (
            <Row label="Coupon discount" value={`-${formatINR(totals.couponDiscount)}`} styles={styles} accent={theme.success} />
          ) : null}
          {totals.memberDiscount > 0 ? (
            <Row label="Member discount" value={`-${formatINR(totals.memberDiscount)}`} styles={styles} accent={theme.success} />
          ) : null}
          <Row
            label="Delivery fee"
            value={totals.delivery === 0 ? 'Free' : formatINR(totals.delivery)}
            styles={styles}
          />
          {totals.delivery > 0 ? (
            <Text style={styles.hint}>Add {formatINR(totals.freeDeliveryThreshold - totals.subtotal)} more for free delivery.</Text>
          ) : null}
          <View style={styles.divider} />
          <Row label="Total payable" value={formatINR(totals.total)} styles={styles} bold />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerLabel}>Total payable</Text>
          <Text style={styles.footerValue}>{formatINR(totals.total)}</Text>
        </View>
        <View style={styles.footerButton}>
          <PrimaryButton label="Checkout" onPress={() => router.push('/checkout')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  styles,
  bold,
  accent,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof makeStyles>;
  bold?: boolean;
  accent?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.boldText]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.boldText, accent ? { color: accent } : null]}>{value}</Text>
    </View>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 14 },
    item: {
      flexDirection: 'row',
      gap: 12,
      padding: 12,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    thumb: { width: 84, height: 96, borderRadius: 14, backgroundColor: t.secondary },
    itemCopy: { flex: 1, gap: 2 },
    brand: { fontFamily: FONT.bold, fontSize: 11, color: t.strong, textTransform: 'uppercase', letterSpacing: 0.5 },
    name: { fontFamily: FONT.semibold, fontSize: 14, color: t.ink, lineHeight: 19 },
    variant: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    itemFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.border,
      overflow: 'hidden',
    },
    stepBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    stepDisabled: { opacity: 0.4 },
    qty: { minWidth: 28, textAlign: 'center', fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    lineTotal: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    remove: { alignSelf: 'flex-start', padding: 4 },
    card: {
      padding: 16,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      gap: 12,
    },
    cardTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    couponRow: { flexDirection: 'row', gap: 10 },
    couponInput: {
      flex: 1,
      minHeight: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.border,
      paddingHorizontal: 14,
      fontFamily: FONT.bold,
      fontSize: 15,
      color: t.ink,
      letterSpacing: 0.5,
    },
    applyButton: {
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor: t.strong,
      justifyContent: 'center',
    },
    applyText: { fontFamily: FONT.bold, fontSize: 15, color: '#FFFFFF' },
    disabled: { opacity: 0.45 },
    appliedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: 12,
    },
    appliedText: { flex: 1, fontFamily: FONT.bold, fontSize: 14, color: t.ink },
    error: { fontFamily: FONT.semibold, fontSize: 13, color: t.error },
    hint: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    rowLabel: { fontFamily: FONT.regular, fontSize: 15, color: t.muted },
    rowValue: { fontFamily: FONT.semibold, fontSize: 15, color: t.ink },
    boldText: { fontFamily: FONT.bold, color: t.ink, fontSize: 16 },
    divider: { height: 1, backgroundColor: t.border },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: t.card,
      borderTopWidth: 1,
      borderTopColor: t.border,
    },
    footerTotal: { gap: 2 },
    footerLabel: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    footerValue: { fontFamily: FONT.bold, fontSize: 20, color: t.ink },
    footerButton: { flex: 1 },
  });
}

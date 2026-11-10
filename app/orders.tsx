import { router } from 'expo-router';
import { ChevronRight, Package } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { formatINR, formatOrderDate } from '@/lib/format';
import { FONT, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function OrdersScreen() {
  const { theme, orders } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="My orders" />
      {orders.length === 0 ? (
        <EmptyState
          icon={<Package size={30} color={theme.strong} />}
          title="No orders yet"
          message="Once you place an order, it will show up here."
          actionLabel="Start shopping"
          onAction={() => router.navigate('/shop')}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {orders.map((order) => (
            <Pressable
              key={order.id}
              onPress={() => router.navigate(`/order/${order.id}`)}
              style={styles.card}
              accessibilityRole="button"
            >
              <View style={[styles.icon, { backgroundColor: theme.secondary }]}>
                <Package size={20} color={theme.strong} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.orderId}>Order {order.id}</Text>
                <Text style={styles.meta}>
                  {formatOrderDate(order.createdAt)}  |  {order.items.length} item{order.items.length === 1 ? '' : 's'}
                </Text>
                <Text style={styles.total}>{formatINR(order.total)}</Text>
              </View>
              <ChevronRight size={18} color={theme.muted} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 12 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    copy: { flex: 1, gap: 2 },
    orderId: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    meta: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    total: { fontFamily: FONT.semibold, fontSize: 14, color: t.ink, marginTop: 2 },
  });
}

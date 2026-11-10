import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { getProduct } from '@/lib/catalog';
import { FONT, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function WishlistScreen() {
  const { theme, wishlist } = useApp();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const items = wishlist.map((id) => getProduct(id)).filter((p) => p !== undefined);
  const cardWidth = (width - 40 - 12) / 2;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={`Wishlist (${items.length})`} />
      {items.length === 0 ? (
        <EmptyState
          icon={<Heart size={30} color={theme.strong} />}
          title="Your wishlist is empty"
          message="Tap the heart on any product to save it for later."
          actionLabel="Browse shop"
          onAction={() => router.navigate('/shop')}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {items.map((product) => (
            <ProductCard key={product.id} product={product} width={cardWidth} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20, paddingBottom: 32 },
  });
}

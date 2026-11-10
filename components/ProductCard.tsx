import { router } from 'expo-router';
import { Heart, Plus, Star } from 'lucide-react-native';
import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/lib/AppContext';
import { formatINR, discountPercent } from '@/lib/format';
import { FONT, type Palette } from '@/lib/theme';
import { useToast } from '@/components/Toast';
import type { Product } from '@/lib/catalog';

export function ProductCard({ product, width }: { product: Product; width?: number }) {
  const { theme, wishlist, toggleWishlist, addToCart } = useApp();
  const toast = useToast();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const liked = wishlist.includes(product.id);
  const off = discountPercent(product.mrp, product.price);

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      style={({ pressed }) => [styles.card, width ? { width } : null, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        <Pressable
          onPress={() => {
            toggleWishlist(product.id);
            toast(liked ? 'Removed from wishlist' : 'Saved to wishlist');
          }}
          hitSlop={8}
          accessibilityLabel={liked ? 'Remove from wishlist' : 'Save to wishlist'}
          style={styles.heart}
        >
          <Heart size={16} color={liked ? theme.strong : theme.muted} fill={liked ? theme.strong : 'transparent'} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.ratingRow}>
          <Star size={13} color={theme.warning} fill={theme.warning} />
          <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatINR(product.price)}</Text>
          <Text style={styles.mrp}>{formatINR(product.mrp)}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.off}>{off}% off</Text>
          <Pressable
            onPress={() => {
              addToCart(product.id, product.variants[0]);
              toast(`${product.name} added to cart`);
            }}
            accessibilityLabel={`Quick add ${product.name}`}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Plus size={14} color={theme.strong} />
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    card: {
      backgroundColor: t.card,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: t.border,
    },
    pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
    imageWrap: { height: 150, backgroundColor: t.secondary },
    image: { width: '100%', height: '100%' },
    heart: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { padding: 12, gap: 4 },
    brand: { fontFamily: FONT.semibold, fontSize: 12, color: t.muted },
    name: { fontFamily: FONT.semibold, fontSize: 14, color: t.ink, minHeight: 36, lineHeight: 18 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontFamily: FONT.semibold, fontSize: 12, color: t.muted },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    price: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    mrp: { fontFamily: FONT.regular, fontSize: 12, color: t.muted, textDecorationLine: 'line-through' },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    off: { fontFamily: FONT.semibold, fontSize: 12, color: t.success },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: t.strong,
    },
    addText: { fontFamily: FONT.bold, fontSize: 13, color: t.strong },
  });
}

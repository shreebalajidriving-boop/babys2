import { router, useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronUp, Heart, ShoppingCart, Star, Truck } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { REVIEWS, getProduct, productsInCategory } from '@/lib/catalog';
import { discountPercent, formatDelivery, formatINR } from '@/lib/format';
import { FONT, type Palette } from '@/lib/theme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProductCard } from '@/components/ProductCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { EmptyState } from '@/components/EmptyState';
import { useToast } from '@/components/Toast';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getProduct(id);
  const { theme, wishlist, cart, toggleWishlist, addToCart } = useApp();
  const toast = useToast();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [variant, setVariant] = useState(product?.variants[0] ?? '');
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Product" />
        <EmptyState title="Product not found" message="This product is no longer available." actionLabel="Back to shop" onAction={() => router.navigate('/shop')} />
      </SafeAreaView>
    );
  }

  const liked = wishlist.includes(product.id);
  const inCartQty = cart.find((item) => item.productId === product.id && item.variant === variant)?.qty ?? 0;
  const related = productsInCategory(product.categoryId).filter((p) => p.id !== product.id);
  const off = discountPercent(product.mrp, product.price);
  const cardWidth = (width - 40 - 12) / 2.2;

  const handleAdd = () => {
    addToCart(product.id, variant);
    toast(`${product.name} added to cart`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={product.brand} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageCard}>
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
          <Pressable
            onPress={() => {
              toggleWishlist(product.id);
              toast(liked ? 'Removed from wishlist' : 'Saved to wishlist');
            }}
            style={styles.heart}
            accessibilityLabel={liked ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart size={20} color={liked ? theme.strong : theme.ink} fill={liked ? theme.strong : 'transparent'} />
          </Pressable>
        </View>

        <View style={styles.block}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <View style={styles.ratingRow}>
            <Star size={16} color={theme.warning} fill={theme.warning} />
            <Text style={styles.ratingText}>
              {product.rating.toFixed(1)} · {product.reviews.toLocaleString('en-IN')} ratings
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatINR(product.price)}</Text>
            <Text style={styles.mrp}>{formatINR(product.mrp)}</Text>
            <View style={[styles.offBadge, { backgroundColor: theme.secondary }]}>
              <Text style={[styles.offText, { color: theme.strong }]}>{off}% off</Text>
            </View>
          </View>
          <Text style={styles.tax}>Inclusive of all taxes</Text>
        </View>

        <View style={styles.delivery}>
          <Truck size={18} color={theme.strong} />
          <Text style={styles.deliveryText}>
            Delivery by {formatDelivery(2)}. Free delivery above ₹499.
          </Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Choose variant</Text>
          <View style={styles.chips}>
            {product.variants.map((option) => {
              const active = option === variant;
              return (
                <Pressable
                  key={option}
                  onPress={() => setVariant(option)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[styles.chip, active && { borderColor: theme.strong, backgroundColor: theme.secondary }]}
                >
                  <Text style={[styles.chipText, active && { color: theme.strong }]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.body}>{product.description}</Text>
        </View>

        <Pressable
          onPress={() => setDetailsOpen((open) => !open)}
          style={styles.accordion}
          accessibilityRole="button"
          accessibilityState={{ expanded: detailsOpen }}
        >
          <Text style={styles.sectionTitle}>Highlights and details</Text>
          {detailsOpen ? <ChevronUp size={20} color={theme.ink} /> : <ChevronDown size={20} color={theme.ink} />}
        </Pressable>
        {detailsOpen ? (
          <View style={styles.highlights}>
            {product.highlights.map((item) => (
              <Text key={item} style={styles.highlight}>
                • {item}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Parent reviews</Text>
          {REVIEWS.map((review) => (
            <View key={review.name} style={styles.review}>
              <View style={styles.ratingRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} color={theme.warning} fill={i < review.rating ? theme.warning : 'transparent'} />
                ))}
                <Text style={styles.reviewName}>{review.name}</Text>
              </View>
              <Text style={styles.body}>{review.text}</Text>
            </View>
          ))}
        </View>

        {related.length > 0 ? (
          <View style={styles.block}>
            <Text style={styles.sectionTitle}>You may also like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedRow}>
              {related.map((item) => (
                <ProductCard key={item.id} product={item} width={cardWidth} />
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {inCartQty > 0 ? (
          <Pressable onPress={() => router.push('/cart')} style={styles.inCart} accessibilityRole="button">
            <Text style={[styles.inCartText, { color: theme.strong }]}>In cart ({inCartQty})</Text>
            <Text style={styles.inCartLink}>View cart</Text>
          </Pressable>
        ) : null}
        <View style={styles.footerRow}>
          <View style={styles.footerAdd}>
            <PrimaryButton label="Add to cart" onPress={handleAdd} />
          </View>
          <Pressable onPress={() => router.push('/cart')} style={styles.cartIcon} accessibilityLabel="Go to cart">
            <ShoppingCart size={20} color={theme.strong} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingBottom: 24, gap: 20 },
    imageCard: {
      height: 320,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: t.secondary,
    },
    image: { width: '100%', height: '100%' },
    heart: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    block: { gap: 10 },
    brand: { fontFamily: FONT.bold, fontSize: 13, color: t.strong, textTransform: 'uppercase', letterSpacing: 0.6 },
    name: { fontFamily: FONT.bold, fontSize: 22, color: t.ink, lineHeight: 28 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    ratingText: { fontFamily: FONT.semibold, fontSize: 14, color: t.muted },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
    price: { fontFamily: FONT.bold, fontSize: 26, color: t.ink },
    mrp: { fontFamily: FONT.regular, fontSize: 15, color: t.muted, textDecorationLine: 'line-through' },
    offBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    offText: { fontFamily: FONT.bold, fontSize: 13 },
    tax: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    delivery: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 14,
      borderRadius: 16,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    deliveryText: { flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink },
    sectionTitle: { fontFamily: FONT.bold, fontSize: 17, color: t.ink },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingHorizontal: 16,
      minHeight: 44,
      justifyContent: 'center',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
    },
    chipText: { fontFamily: FONT.semibold, fontSize: 14, color: t.ink },
    body: { fontFamily: FONT.regular, fontSize: 15, color: t.muted, lineHeight: 23 },
    accordion: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    highlights: { gap: 8, marginTop: -8 },
    highlight: { fontFamily: FONT.regular, fontSize: 15, color: t.ink, lineHeight: 22 },
    review: { gap: 6, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: t.border },
    reviewName: { fontFamily: FONT.bold, fontSize: 13, color: t.ink, marginLeft: 6 },
    relatedRow: { gap: 12, paddingRight: 20 },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 12,
      gap: 10,
      backgroundColor: t.card,
      borderTopWidth: 1,
      borderTopColor: t.border,
    },
    inCart: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    inCartText: { fontFamily: FONT.bold, fontSize: 14 },
    inCartLink: { fontFamily: FONT.bold, fontSize: 14, color: t.strong, textDecorationLine: 'underline' },
    footerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    footerAdd: { flex: 1 },
    cartIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: t.strong,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

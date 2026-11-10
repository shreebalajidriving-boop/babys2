import { router } from 'expo-router';
import { Search, ShoppingCart, Tag, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { CATEGORIES, PRODUCTS, searchProducts } from '@/lib/catalog';
import { FONT, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';

const SUGGESTIONS = ['Diapers', 'Wipes', 'Feeding bottle', 'Stroller', 'Baby lotion', 'Teether'];

export default function ShopScreen() {
  const { theme, cart } = useApp();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [query, setQuery] = useState('');
  const trimmed = query.trim();
  const results = searchProducts(trimmed);
  const cardWidth = (width - 40 - 12) / 2;
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <Pressable onPress={() => router.push('/cart')} style={styles.cartButton} accessibilityLabel="Cart">
          <ShoppingCart size={20} color={theme.ink} />
          {cartCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: theme.strong }]}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.searchBox}>
          <Search size={18} color={theme.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search products, brands, categories"
            placeholderTextColor={theme.muted}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
              <X size={18} color={theme.muted} />
            </Pressable>
          ) : null}
        </View>

        {trimmed ? (
          <>
            <Text style={styles.resultCount}>
              {results.length} {results.length === 1 ? 'result' : 'results'} for "{trimmed}"
            </Text>
            {results.length > 0 ? (
              <View style={styles.grid}>
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} width={cardWidth} />
                ))}
              </View>
            ) : (
              <EmptyState
                title="No products found"
                message="Try a different word, or browse the categories below."
                actionLabel="Clear search"
                onAction={() => setQuery('')}
              />
            )}
          </>
        ) : (
          <>
            <View style={styles.chips}>
              {SUGGESTIONS.map((suggestion) => (
                <Pressable key={suggestion} onPress={() => setQuery(suggestion)} style={styles.chip}>
                  <Text style={styles.chipText}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.offer}>
              <View style={styles.offerIcon}>
                <Tag size={20} color={theme.strong} />
              </View>
              <View style={styles.offerCopy}>
                <Text style={styles.offerTitle}>BLISS10 gives you 10% off</Text>
                <Text style={styles.offerBody}>On orders above ₹499 at checkout. Free delivery above ₹499.</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Shop by category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => router.push(`/category/${category.id}`)}
                    style={styles.categoryTile}
                    accessibilityRole="button"
                  >
                    <View style={styles.categoryIcon}>
                      <Icon size={24} color={theme.strong} />
                    </View>
                    <Text style={styles.categoryName} numberOfLines={2}>
                      {category.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>Best sellers</Text>
            <View style={styles.grid}>
              {PRODUCTS.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} width={cardWidth} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
    },
    title: { fontFamily: FONT.bold, fontSize: 26, color: t.ink },
    cartButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeText: { fontFamily: FONT.bold, fontSize: 10, color: '#FFFFFF' },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 20 },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 52,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    searchInput: { flex: 1, fontFamily: FONT.regular, fontSize: 15, color: t.ink, minHeight: 48 },
    resultCount: { fontFamily: FONT.semibold, fontSize: 14, color: t.muted },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    chipText: { fontFamily: FONT.semibold, fontSize: 13, color: t.ink },
    offer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      borderRadius: 18,
      backgroundColor: t.secondary,
    },
    offerIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: t.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    offerCopy: { flex: 1, gap: 2 },
    offerTitle: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    offerBody: { fontFamily: FONT.regular, fontSize: 13, color: t.muted, lineHeight: 18 },
    sectionTitle: { fontFamily: FONT.bold, fontSize: 18, color: t.ink, marginTop: 4 },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 },
    categoryTile: { width: '33.33%', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
    categoryIcon: {
      width: 64,
      height: 64,
      borderRadius: 22,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoryName: { fontFamily: FONT.semibold, fontSize: 12, color: t.ink, textAlign: 'center', minHeight: 32 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  });
}

import { router } from 'expo-router';
import { ArrowUpDown, Check, Search, ShoppingCart, SlidersHorizontal, Star, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { CATEGORIES, PRODUCTS, productsInCategory, searchProducts, type Product } from '@/lib/catalog';
import { FONT, RADIUS, SPACE, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { PhoneModal } from '@/components/PhoneModal';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProductCard } from '@/components/ProductCard';

type SortKey = 'popular' | 'priceAsc' | 'priceDesc' | 'rating';
type FilterTab = 'category' | 'brand' | 'price' | 'rating';

type Filters = {
  shelfId: string;
  brands: string[];
  maxPrice: number | null;
  minRating: number | null;
};

const PRICE_CAPS = [500, 1000, 2000, 5000];
const RATINGS = [4, 4.5];
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'popular', label: 'Popularity' },
  { key: 'priceAsc', label: 'Price — Low to High' },
  { key: 'priceDesc', label: 'Price — High to Low' },
  { key: 'rating', label: 'Customer Rating' },
];
const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'category', label: 'Category' },
  { key: 'brand', label: 'Brand' },
  { key: 'price', label: 'Price' },
  { key: 'rating', label: 'Customer Rating' },
];
const EMPTY_FILTERS: Filters = { shelfId: 'all', brands: [], maxPrice: null, minRating: null };

function sortProducts(products: Product[], sort: SortKey) {
  const list = [...products];
  if (sort === 'priceAsc') list.sort((a, b) => a.price - b.price);
  if (sort === 'priceDesc') list.sort((a, b) => b.price - a.price);
  if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
  if (sort === 'popular') list.sort((a, b) => b.reviews - a.reviews);
  return list;
}

function countFilters(filters: Filters) {
  return (
    (filters.shelfId !== 'all' ? 1 : 0) +
    filters.brands.length +
    (filters.maxPrice ? 1 : 0) +
    (filters.minRating ? 1 : 0)
  );
}

export default function ShopScreen() {
  const { theme, cart } = useApp();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>('popular');
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [filterTab, setFilterTab] = useState<FilterTab>('category');
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);

  const trimmed = query.trim();
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cardWidth = Math.max((width - 40 - 12) / 2, 140);
  const filterCount = countFilters(filters);

  const brandOptions = useMemo(() => {
    const pool =
      draft.shelfId === 'all' ? PRODUCTS : productsInCategory(draft.shelfId);
    return Array.from(new Set(pool.map((p) => p.brand))).sort();
  }, [draft.shelfId]);

  const visible = useMemo(() => {
    const searched = trimmed ? searchProducts(trimmed) : PRODUCTS;
    const byShelf =
      filters.shelfId === 'all' ? searched : searched.filter((p) => p.categoryId === filters.shelfId);
    const filtered = byShelf.filter(
      (p) =>
        (filters.brands.length === 0 || filters.brands.includes(p.brand)) &&
        (filters.maxPrice === null || p.price <= filters.maxPrice) &&
        (filters.minRating === null || p.rating >= filters.minRating),
    );
    return sortProducts(filtered, sort);
  }, [trimmed, filters, sort]);

  const openFilter = () => {
    setDraft(filters);
    setFilterTab('category');
    setShowFilter(true);
  };

  const applyFilters = () => {
    setFilters(draft);
    setShowFilter(false);
  };

  const clearDraft = () => setDraft(EMPTY_FILTERS);

  const toggleBrand = (brand: string) =>
    setDraft((current) => ({
      ...current,
      brands: current.brands.includes(brand)
        ? current.brands.filter((b) => b !== brand)
        : [...current.brands, brand],
    }));

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

      <View style={styles.searchBox}>
        <Search size={18} color={theme.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search for products, brands and more"
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

      <View style={styles.actionBar}>
        <Pressable onPress={() => setShowSort(true)} style={styles.actionBtn} accessibilityRole="button">
          <ArrowUpDown size={16} color={theme.ink} />
          <Text style={styles.actionText}>Sort</Text>
        </Pressable>
        <View style={styles.actionDivider} />
        <Pressable onPress={openFilter} style={styles.actionBtn} accessibilityRole="button">
          <SlidersHorizontal size={16} color={theme.ink} />
          <Text style={styles.actionText}>Filter{filterCount ? ` ({filterCount})` : ''}</Text>
        </Pressable>
      </View>

      {filterCount > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeRow}>
          {filters.shelfId !== 'all' ? (
            <ActiveChip
              label={CATEGORIES.find((c) => c.id === filters.shelfId)?.name ?? 'Category'}
              onClear={() => setFilters((f) => ({ ...f, shelfId: 'all' }))}
              styles={styles}
            />
          ) : null}
          {filters.brands.map((brand) => (
            <ActiveChip
              key={brand}
              label={brand}
              onClear={() => setFilters((f) => ({ ...f, brands: f.brands.filter((b) => b !== brand) }))}
              styles={styles}
            />
          ))}
          {filters.maxPrice ? (
            <ActiveChip
              label={`Under ₹${filters.maxPrice.toLocaleString('en-IN')}`}
              onClear={() => setFilters((f) => ({ ...f, maxPrice: null }))}
              styles={styles}
            />
          ) : null}
          {filters.minRating ? (
            <ActiveChip
              label={`${filters.minRating}+ rating`}
              onClear={() => setFilters((f) => ({ ...f, minRating: null }))}
              styles={styles}
            />
          ) : null}
          <Pressable onPress={() => setFilters(EMPTY_FILTERS)} style={styles.clearAllChip}>
            <Text style={styles.clearAllText}>Clear all</Text>
          </Pressable>
        </ScrollView>
      ) : null}

      <Text style={styles.resultCount}>
        {visible.length} {visible.length === 1 ? 'result' : 'results'}
        {trimmed ? ` for “${trimmed}”` : ''}
      </Text>

      {visible.length > 0 ? (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} width={cardWidth} />
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          title="No products found"
          message="Try a different search or clear filters."
          actionLabel="Clear filters"
          onAction={() => {
            setFilters(EMPTY_FILTERS);
            setQuery('');
          }}
        />
      )}

      <PhoneModal visible={showSort} animationType="slide" onRequestClose={() => setShowSort(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowSort(false)}>
          <Pressable style={styles.sortSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Sort By</Text>
            {SORTS.map((option) => {
              const active = sort === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => {
                    setSort(option.key);
                    setShowSort(false);
                  }}
                  style={styles.sortRow}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.sortLabel, active && { color: theme.strong }]}>{option.label}</Text>
                  <View style={[styles.radio, active && { borderColor: theme.strong }]}>
                    {active ? <View style={[styles.radioDot, { backgroundColor: theme.strong }]} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </PhoneModal>

      <PhoneModal visible={showFilter} animationType="slide" onRequestClose={() => setShowFilter(false)}>
        <SafeAreaView style={styles.filterSafe} edges={['top', 'bottom']}>
          <View style={styles.filterHeader}>
            <Text style={styles.sheetTitle}>Filters</Text>
            <Pressable onPress={() => setShowFilter(false)} hitSlop={12} accessibilityLabel="Close filters">
              <X size={22} color={theme.ink} />
            </Pressable>
          </View>

          <View style={styles.filterBody}>
            <ScrollView style={styles.filterTabs} showsVerticalScrollIndicator={false}>
              {FILTER_TABS.map((tab) => {
                const active = filterTab === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setFilterTab(tab.key)}
                    style={[styles.filterTab, active && styles.filterTabActive]}
                  >
                    <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>{tab.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <ScrollView style={styles.filterOptions} contentContainerStyle={styles.filterOptionsContent}>
              {filterTab === 'category'
                ? [
                    { id: 'all', name: 'All Categories' },
                    ...CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
                  ].map((item) => {
                    const active = draft.shelfId === item.id;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => setDraft((d) => ({ ...d, shelfId: item.id, brands: [] }))}
                        style={styles.optionRow}
                      >
                        <Text style={[styles.optionText, active && { color: theme.strong, fontFamily: FONT.bold }]}>
                          {item.name}
                        </Text>
                        <View style={[styles.checkBox, active && { borderColor: theme.strong, backgroundColor: theme.strong }]}>
                          {active ? <Check size={12} color="#FFFFFF" /> : null}
                        </View>
                      </Pressable>
                    );
                  })
                : null}

              {filterTab === 'brand'
                ? brandOptions.map((brand) => {
                    const active = draft.brands.includes(brand);
                    return (
                      <Pressable key={brand} onPress={() => toggleBrand(brand)} style={styles.optionRow}>
                        <Text style={[styles.optionText, active && { color: theme.strong, fontFamily: FONT.bold }]}>
                          {brand}
                        </Text>
                        <View style={[styles.checkBox, active && { borderColor: theme.strong, backgroundColor: theme.strong }]}>
                          {active ? <Check size={12} color="#FFFFFF" /> : null}
                        </View>
                      </Pressable>
                    );
                  })
                : null}

              {filterTab === 'price'
                ? PRICE_CAPS.map((cap) => {
                    const active = draft.maxPrice === cap;
                    return (
                      <Pressable
                        key={cap}
                        onPress={() => setDraft((d) => ({ ...d, maxPrice: active ? null : cap }))}
                        style={styles.optionRow}
                      >
                        <Text style={[styles.optionText, active && { color: theme.strong, fontFamily: FONT.bold }]}>
                          Under ₹{cap.toLocaleString('en-IN')}
                        </Text>
                        <View style={[styles.radio, active && { borderColor: theme.strong }]}>
                          {active ? <View style={[styles.radioDot, { backgroundColor: theme.strong }]} /> : null}
                        </View>
                      </Pressable>
                    );
                  })
                : null}

              {filterTab === 'rating'
                ? RATINGS.map((rating) => {
                    const active = draft.minRating === rating;
                    return (
                      <Pressable
                        key={rating}
                        onPress={() => setDraft((d) => ({ ...d, minRating: active ? null : rating }))}
                        style={styles.optionRow}
                      >
                        <View style={styles.ratingOption}>
                          <Star size={14} color={theme.warning} fill={theme.warning} />
                          <Text style={[styles.optionText, active && { color: theme.strong, fontFamily: FONT.bold }]}>
                            {rating}★ & above
                          </Text>
                        </View>
                        <View style={[styles.radio, active && { borderColor: theme.strong }]}>
                          {active ? <View style={[styles.radioDot, { backgroundColor: theme.strong }]} /> : null}
                        </View>
                      </Pressable>
                    );
                  })
                : null}
            </ScrollView>
          </View>

          <View style={styles.filterFooter}>
            <Pressable onPress={clearDraft} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear Filters</Text>
            </Pressable>
            <View style={styles.applyWrap}>
              <PrimaryButton label="Apply" onPress={applyFilters} />
            </View>
          </View>
        </SafeAreaView>
      </PhoneModal>
    </SafeAreaView>
  );
}

function ActiveChip({
  label,
  onClear,
  styles,
}: {
  label: string;
  onClear: () => void;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <Pressable onPress={onClear} style={styles.activeChip}>
      <Text style={styles.activeChipText}>{label}</Text>
      <X size={12} color={styles.activeChipText.color as string} />
    </Pressable>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACE.pageX,
      paddingTop: SPACE.md,
      paddingBottom: SPACE.sm,
    },
    title: { fontFamily: FONT.bold, fontSize: 28, color: t.ink, letterSpacing: -0.4 },
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
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 46,
      marginHorizontal: SPACE.pageX,
      paddingHorizontal: 14,
      borderRadius: RADIUS.md,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    searchInput: { flex: 1, fontFamily: FONT.regular, fontSize: 14, color: t.ink, minHeight: 42 },
    actionBar: {
      flexDirection: 'row',
      marginTop: 10,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
    },
    actionBtn: {
      flex: 1,
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    actionDivider: { width: 1, backgroundColor: t.border },
    actionText: { fontFamily: FONT.bold, fontSize: 14, color: t.ink },
    activeRow: { gap: 8, paddingHorizontal: SPACE.pageX, paddingTop: 10, paddingBottom: 2 },
    activeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: RADIUS.pill,
      backgroundColor: t.secondary,
      borderWidth: 1,
      borderColor: t.border,
    },
    activeChipText: { fontFamily: FONT.semibold, fontSize: 12, color: t.ink },
    clearAllChip: { paddingHorizontal: 10, paddingVertical: 6, justifyContent: 'center' },
    clearAllText: { fontFamily: FONT.bold, fontSize: 12, color: t.strong },
    resultCount: {
      fontFamily: FONT.semibold,
      fontSize: 13,
      color: t.muted,
      paddingHorizontal: SPACE.pageX,
      paddingTop: 10,
      paddingBottom: 6,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: SPACE.pageX, paddingBottom: 32 },
    backdrop: { flex: 1, backgroundColor: 'rgba(20,28,40,0.4)', justifyContent: 'flex-end' },
    sortSheet: {
      backgroundColor: t.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 28,
      paddingHorizontal: 20,
      width: '100%',
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.border,
      marginTop: 10,
      marginBottom: 8,
    },
    sheetTitle: { fontFamily: FONT.bold, fontSize: 18, color: t.ink, marginBottom: 8 },
    sortRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.border,
    },
    sortLabel: { fontFamily: FONT.semibold, fontSize: 15, color: t.ink },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: t.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioDot: { width: 10, height: 10, borderRadius: 5 },
    filterSafe: { flex: 1, backgroundColor: t.background },
    filterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACE.pageX,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
      backgroundColor: t.card,
    },
    filterBody: { flex: 1, flexDirection: 'row' },
    filterTabs: {
      width: 128,
      backgroundColor: t.secondary,
      borderRightWidth: 1,
      borderRightColor: t.border,
    },
    filterTab: {
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderLeftWidth: 3,
      borderLeftColor: 'transparent',
    },
    filterTabActive: {
      backgroundColor: t.card,
      borderLeftColor: t.strong,
    },
    filterTabText: { fontFamily: FONT.semibold, fontSize: 13, color: t.muted },
    filterTabTextActive: { color: t.strong, fontFamily: FONT.bold },
    filterOptions: { flex: 1, backgroundColor: t.card },
    filterOptionsContent: { paddingVertical: 4, paddingBottom: 24 },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.border,
    },
    optionText: { flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink, paddingRight: 12 },
    ratingOption: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
    checkBox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: t.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: SPACE.pageX,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: t.border,
      backgroundColor: t.card,
    },
    clearBtn: { paddingHorizontal: 8, paddingVertical: 12 },
    clearBtnText: { fontFamily: FONT.bold, fontSize: 14, color: t.strong },
    applyWrap: { flex: 1 },
  });
}

import { router, useLocalSearchParams } from 'expo-router';
import { ArrowUpDown, Check, SlidersHorizontal, Star, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { getCategory, productsInCategory, type Product } from '@/lib/catalog';
import { FONT, RADIUS, SPACE, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { PhoneModal } from '@/components/PhoneModal';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProductCard } from '@/components/ProductCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchField } from '@/components/SearchField';

type SortKey = 'popular' | 'priceAsc' | 'priceDesc' | 'rating';
type FilterTab = 'brand' | 'price' | 'rating';
type Filters = { brands: string[]; maxPrice: number | null; minRating: number | null };

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'popular', label: 'Popularity' },
  { key: 'priceAsc', label: 'Price — Low to High' },
  { key: 'priceDesc', label: 'Price — High to Low' },
  { key: 'rating', label: 'Customer Rating' },
];
const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'brand', label: 'Brand' },
  { key: 'price', label: 'Price' },
  { key: 'rating', label: 'Customer Rating' },
];
const PRICE_CAPS = [500, 1000, 2000, 5000];
const RATINGS = [4, 4.5];
const EMPTY: Filters = { brands: [], maxPrice: null, minRating: null };

function sortProducts(products: Product[], sort: SortKey) {
  const list = [...products];
  if (sort === 'priceAsc') list.sort((a, b) => a.price - b.price);
  if (sort === 'priceDesc') list.sort((a, b) => b.price - a.price);
  if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
  if (sort === 'popular') list.sort((a, b) => b.reviews - a.reviews);
  return list;
}

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const category = getCategory(id);
  const { theme } = useApp();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [sort, setSort] = useState<SortKey>('popular');
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterTab, setFilterTab] = useState<FilterTab>('brand');
  const [query, setQuery] = useState('');

  if (!category) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Category" />
        <EmptyState
          title="Category not found"
          message="This category is not available."
          actionLabel="Back to shop"
          onAction={() => router.navigate('/shop')}
        />
      </SafeAreaView>
    );
  }

  const q = query.trim().toLowerCase();
  const all = productsInCategory(category.id);
  const brandOptions = Array.from(new Set(all.map((p) => p.brand))).sort();
  const filtered = all.filter(
    (p) =>
      (filters.brands.length === 0 || filters.brands.includes(p.brand)) &&
      (filters.maxPrice === null || p.price <= filters.maxPrice) &&
      (filters.minRating === null || p.rating >= filters.minRating) &&
      (!q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.highlights.some((h) => h.toLowerCase().includes(q))),
  );
  const visible = sortProducts(filtered, sort);
  const filterCount = filters.brands.length + (filters.maxPrice ? 1 : 0) + (filters.minRating ? 1 : 0);
  const cardWidth = (width - 40 - 12) / 2;

  const toggleBrand = (brand: string) =>
    setDraft((d) => ({
      ...d,
      brands: d.brands.includes(brand) ? d.brands.filter((b) => b !== brand) : [...d.brands, brand],
    }));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={category.name} />

      <View style={styles.searchWrap}>
        <SearchField value={query} onChangeText={setQuery} placeholder={`Search in ${category.name}`} />
      </View>

      <View style={styles.actionBar}>
        <Pressable onPress={() => setShowSort(true)} style={styles.actionBtn}>
          <ArrowUpDown size={16} color={theme.ink} />
          <Text style={styles.actionText}>Sort</Text>
        </Pressable>
        <View style={styles.actionDivider} />
        <Pressable
          onPress={() => {
            setDraft(filters);
            setFilterTab('brand');
            setShowFilter(true);
          }}
          style={styles.actionBtn}
        >
          <SlidersHorizontal size={16} color={theme.ink} />
          <Text style={styles.actionText}>Filter{filterCount ? ` ({filterCount})` : ''}</Text>
        </Pressable>
      </View>

      <Text style={styles.count}>
        {visible.length} {visible.length === 1 ? 'product' : 'products'}
      </Text>

      {visible.length > 0 ? (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} width={cardWidth} />
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          title="No products match"
          message="Try another search or clear filters."
          actionLabel="Clear all"
          onAction={() => {
            setFilters(EMPTY);
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
            <Pressable onPress={() => setShowFilter(false)} hitSlop={12}>
              <X size={22} color={theme.ink} />
            </Pressable>
          </View>
          <View style={styles.filterBody}>
            <ScrollView style={styles.filterTabs}>
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
            <ScrollView style={styles.filterOptions} contentContainerStyle={{ paddingBottom: 24 }}>
              {filterTab === 'brand'
                ? brandOptions.map((brand) => {
                    const active = draft.brands.includes(brand);
                    return (
                      <Pressable key={brand} onPress={() => toggleBrand(brand)} style={styles.optionRow}>
                        <Text style={[styles.optionText, active && { color: theme.strong }]}>{brand}</Text>
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
                        <Text style={[styles.optionText, active && { color: theme.strong }]}>
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                          <Star size={14} color={theme.warning} fill={theme.warning} />
                          <Text style={[styles.optionText, active && { color: theme.strong }]}>{rating}★ & above</Text>
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
            <Pressable onPress={() => setDraft(EMPTY)} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear Filters</Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="Apply"
                onPress={() => {
                  setFilters(draft);
                  setShowFilter(false);
                }}
              />
            </View>
          </View>
        </SafeAreaView>
      </PhoneModal>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    searchWrap: { paddingHorizontal: SPACE.pageX, paddingTop: 8, paddingBottom: 4 },
    actionBar: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
    },
    actionBtn: { flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    actionDivider: { width: 1, backgroundColor: t.border },
    actionText: { fontFamily: FONT.bold, fontSize: 14, color: t.ink },
    count: { fontFamily: FONT.semibold, fontSize: 13, color: t.muted, paddingHorizontal: SPACE.pageX, paddingVertical: 10 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: SPACE.pageX, paddingBottom: 32 },
    backdrop: { flex: 1, backgroundColor: 'rgba(20,28,40,0.4)', justifyContent: 'flex-end' },
    sortSheet: {
      backgroundColor: t.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 28,
      paddingHorizontal: 20,
      paddingTop: 10,
      width: '100%',
      maxWidth: '100%',
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.border,
      marginBottom: 12,
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
    filterTabs: { width: 128, backgroundColor: t.secondary, borderRightWidth: 1, borderRightColor: t.border },
    filterTab: { paddingVertical: 16, paddingHorizontal: 12, borderLeftWidth: 3, borderLeftColor: 'transparent' },
    filterTabActive: { backgroundColor: t.card, borderLeftColor: t.strong },
    filterTabText: { fontFamily: FONT.semibold, fontSize: 13, color: t.muted },
    filterTabTextActive: { color: t.strong, fontFamily: FONT.bold },
    filterOptions: { flex: 1, backgroundColor: t.card },
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
  });
}

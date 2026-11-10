import { router, useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronUp, Check, SlidersHorizontal, Star } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { getCategory, productsInCategory, type Product } from '@/lib/catalog';
import { FONT, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProductCard } from '@/components/ProductCard';
import { ScreenHeader } from '@/components/ScreenHeader';

type SortKey = 'popular' | 'priceAsc' | 'priceDesc' | 'rating';
type Filters = { brands: string[]; maxPrice: number | null; minRating: number | null };

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'popular', label: 'Popularity' },
  { key: 'priceAsc', label: 'Price: low to high' },
  { key: 'priceDesc', label: 'Price: high to low' },
  { key: 'rating', label: 'Top rated' },
];
const PRICE_CAPS = [500, 1000, 5000];
const RATINGS = [4, 4.5];
const NO_FILTERS: Filters = { brands: [], maxPrice: null, minRating: null };

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
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  if (!category) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Category" />
        <EmptyState title="Category not found" message="This category is not available." actionLabel="Back to shop" onAction={() => router.navigate('/shop')} />
      </SafeAreaView>
    );
  }

  const all = productsInCategory(category.id);
  const brands = Array.from(new Set(all.map((p) => p.brand)));
  const filtered = all.filter(
    (p) =>
      (filters.brands.length === 0 || filters.brands.includes(p.brand)) &&
      (filters.maxPrice === null || p.price <= filters.maxPrice) &&
      (filters.minRating === null || p.rating >= filters.minRating),
  );
  const visible = sortProducts(filtered, sort);
  const activeFilterCount =
    filters.brands.length + (filters.maxPrice !== null ? 1 : 0) + (filters.minRating !== null ? 1 : 0);
  const cardWidth = (width - 40 - 12) / 2;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={category.name} />

      <View style={styles.toolbar}>
        <Pressable
          onPress={() => setShowFilters(true)}
          style={[styles.filterButton, activeFilterCount > 0 && { borderColor: theme.strong }]}
          accessibilityRole="button"
        >
          <SlidersHorizontal size={16} color={theme.ink} />
          <Text style={styles.filterText}>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</Text>
        </Pressable>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
          {SORTS.map((option) => {
            const active = sort === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => setSort(option.key)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.sortChip, active && { backgroundColor: theme.strong, borderColor: theme.strong }]}
              >
                <Text style={[styles.sortText, active && { color: '#FFFFFF' }]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
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
          title="No products match these filters"
          message="Try removing a filter to see more products."
          actionLabel="Clear filters"
          onAction={() => setFilters(NO_FILTERS)}
        />
      )}

      <FilterSheet
        visible={showFilters}
        brands={brands}
        initial={filters}
        onClose={() => setShowFilters(false)}
        onApply={(next) => {
          setFilters(next);
          setShowFilters(false);
        }}
      />
    </SafeAreaView>
  );
}

function FilterSheet({
  visible,
  brands,
  initial,
  onClose,
  onApply,
}: {
  visible: boolean;
  brands: string[];
  initial: Filters;
  onClose: () => void;
  onApply: (filters: Filters) => void;
}) {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [draft, setDraft] = useState<Filters>(initial);
  const [brandsOpen, setBrandsOpen] = useState(true);

  const toggleBrand = (brand: string) =>
    setDraft((d) => ({
      ...d,
      brands: d.brands.includes(brand) ? d.brands.filter((b) => b !== brand) : [...d.brands, brand],
    }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} onShow={() => setDraft(initial)}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close filters" />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Filters</Text>

          <ScrollView contentContainerStyle={styles.sheetBody}>
            <Pressable onPress={() => setBrandsOpen((o) => !o)} style={styles.accordionHeader} accessibilityRole="button">
              <Text style={styles.sectionLabel}>Brand</Text>
              {brandsOpen ? <ChevronUp size={18} color={theme.ink} /> : <ChevronDown size={18} color={theme.ink} />}
            </Pressable>
            {brandsOpen ? (
              <View style={styles.chips}>
                {brands.map((brand) => {
                  const active = draft.brands.includes(brand);
                  return (
                    <Pressable
                      key={brand}
                      onPress={() => toggleBrand(brand)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: active }}
                      style={[styles.chip, active && { borderColor: theme.strong, backgroundColor: theme.secondary }]}
                    >
                      {active ? <Check size={14} color={theme.strong} /> : null}
                      <Text style={styles.chipText}>{brand}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            <Text style={styles.sectionLabel}>Price</Text>
            <View style={styles.chips}>
              {PRICE_CAPS.map((cap) => {
                const active = draft.maxPrice === cap;
                return (
                  <Pressable
                    key={cap}
                    onPress={() => setDraft((d) => ({ ...d, maxPrice: active ? null : cap }))}
                    style={[styles.chip, active && { borderColor: theme.strong, backgroundColor: theme.secondary }]}
                  >
                    <Text style={styles.chipText}>Under ₹{cap.toLocaleString('en-IN')}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>Customer rating</Text>
            <View style={styles.chips}>
              {RATINGS.map((rating) => {
                const active = draft.minRating === rating;
                return (
                  <Pressable
                    key={rating}
                    onPress={() => setDraft((d) => ({ ...d, minRating: active ? null : rating }))}
                    style={[styles.chip, active && { borderColor: theme.strong, backgroundColor: theme.secondary }]}
                  >
                    <Star size={13} color={theme.warning} fill={theme.warning} />
                    <Text style={styles.chipText}>{rating}+ stars</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.sheetFooter}>
            <Pressable onPress={() => setDraft(NO_FILTERS)} style={styles.clearButton} accessibilityRole="button">
              <Text style={styles.clearText}>Clear all</Text>
            </Pressable>
            <View style={styles.applyWrap}>
              <PrimaryButton label="Apply filters" onPress={() => onApply(draft)} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    toolbar: { gap: 12, paddingTop: 8 },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 8,
      marginLeft: 20,
      paddingHorizontal: 14,
      minHeight: 40,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
    },
    filterText: { fontFamily: FONT.bold, fontSize: 14, color: t.ink },
    sortRow: { gap: 8, paddingHorizontal: 20 },
    sortChip: {
      paddingHorizontal: 14,
      minHeight: 36,
      justifyContent: 'center',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
    },
    sortText: { fontFamily: FONT.semibold, fontSize: 13, color: t.ink },
    count: { fontFamily: FONT.semibold, fontSize: 14, color: t.muted, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20, paddingBottom: 32 },
    backdrop: { flex: 1, backgroundColor: 'rgba(20, 28, 40, 0.4)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: t.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '80%',
      paddingBottom: 24,
    },
    sheetHandle: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: t.border,
      marginTop: 10,
    },
    sheetTitle: { fontFamily: FONT.bold, fontSize: 20, color: t.ink, paddingHorizontal: 24, paddingTop: 16 },
    sheetBody: { paddingHorizontal: 24, paddingVertical: 16, gap: 14 },
    accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionLabel: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      minHeight: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
    },
    chipText: { fontFamily: FONT.semibold, fontSize: 14, color: t.ink },
    sheetFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 24,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: t.border,
    },
    clearButton: { paddingHorizontal: 8, paddingVertical: 12 },
    clearText: { fontFamily: FONT.bold, fontSize: 15, color: t.strong },
    applyWrap: { flex: 1 },
  });
}

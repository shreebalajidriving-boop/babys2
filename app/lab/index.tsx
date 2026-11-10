import { router } from 'expo-router';
import { Droplets, FlaskConical, Home as HomeIcon } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { LAB_TESTS, type LabTest } from '@/lib/labs';
import { formatINR, discountPercent } from '@/lib/format';
import { FONT, type Palette } from '@/lib/theme';
import { FilterChips } from '@/components/FilterChips';
import { ScreenHeader } from '@/components/ScreenHeader';

type Category = 'all' | LabTest['category'];
const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'all', label: 'All tests' },
  { value: 'Routine', label: 'Routine' },
  { value: 'Vitamins', label: 'Vitamins' },
  { value: 'Allergy', label: 'Allergy' },
  { value: 'Newborn', label: 'Newborn' },
];

export default function LabListingScreen() {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [category, setCategory] = useState<Category>('all');
  const tests = LAB_TESTS.filter((t) => category === 'all' || t.category === category);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Lab tests" />
      <View style={styles.filters}>
        <FilterChips options={CATEGORIES} value={category} onChange={setCategory} />
      </View>
      <FlatList
        data={tests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.banner}>
            <HomeIcon size={18} color={theme.strong} />
            <Text style={styles.bannerText}>Sample collected at home, reports in your app.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.navigate(`/lab/test/${item.id}`)}
            style={styles.card}
            accessibilityRole="button"
          >
            <View style={[styles.icon, { backgroundColor: theme.secondary }]}>
              {item.sample === 'Blood' ? <Droplets size={20} color={theme.strong} /> : <FlaskConical size={20} color={theme.strong} />}
            </View>
            <View style={styles.copy}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.sample} sample  |  Report in {item.reportIn}
                {item.fasting ? '  |  Fasting' : ''}
              </Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatINR(item.price)}</Text>
                <Text style={styles.mrp}>{formatINR(item.mrp)}</Text>
                <Text style={[styles.off, { color: theme.success }]}>{discountPercent(item.mrp, item.price)}% off</Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    filters: { paddingHorizontal: 20, paddingBottom: 12 },
    list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 14,
      borderRadius: 16,
      backgroundColor: t.secondary,
      marginBottom: 4,
    },
    bannerText: { flex: 1, fontFamily: FONT.semibold, fontSize: 13, color: t.ink },
    card: {
      flexDirection: 'row',
      gap: 12,
      padding: 16,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    copy: { flex: 1, gap: 4 },
    name: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    meta: { fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    price: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    mrp: { fontFamily: FONT.regular, fontSize: 13, color: t.muted, textDecorationLine: 'line-through' },
    off: { fontFamily: FONT.semibold, fontSize: 12 },
  });
}

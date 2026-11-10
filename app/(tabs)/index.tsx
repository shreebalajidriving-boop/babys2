import { router } from 'expo-router';
import {
  Bell,
  BookOpen,
  ChevronRight,
  HeartHandshake,
  MapPin,
  Search,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Stethoscope,
  Syringe,
  Users,
} from 'lucide-react-native';
import { useMemo, useRef, useState, type ComponentType } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useApp } from '@/lib/AppContext';
import { PRODUCTS } from '@/lib/catalog';
import { toIsoDate } from '@/lib/schedule';
import { FONT, type Palette } from '@/lib/theme';
import { vaccineReminder } from '@/lib/vaccines';
import { ChildSwitcher } from '@/components/ChildSwitcher';
import { ProductCard } from '@/components/ProductCard';

function greeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

type Banner = {
  title: string;
  body: string;
  cta: string;
  image: string;
  target: string;
  tint: string;
};

const BANNERS: Banner[] = [
  {
    title: 'Diaper week',
    body: 'Up to 30% off on top diaper brands',
    cta: 'Shop diapers',
    image: 'https://images.pexels.com/photos/30344708/pexels-photo-30344708.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    target: '/shop',
    tint: 'rgba(47, 125, 107, 0.45)',
  },
  {
    title: 'Welcome offer',
    body: 'Use WELCOME200 for ₹200 off your first order',
    cta: 'Start shopping',
    image: 'https://images.pexels.com/photos/4642251/pexels-photo-4642251.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    target: '/shop',
    tint: 'rgba(53, 105, 201, 0.45)',
  },
  {
    title: 'Learn every day',
    body: 'Age-based activities that build healthy development',
    cta: 'Explore learning',
    image: 'https://images.pexels.com/photos/37529274/pexels-photo-37529274.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    target: '/learn',
    tint: 'rgba(184, 69, 111, 0.42)',
  },
];

type Service = {
  label: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  target: string;
};

const SERVICES: Service[] = [
  { label: 'Shop', icon: ShoppingBag, target: '/shop' },
  { label: 'Doctors', icon: Stethoscope, target: '/care' },
  { label: 'Vaccines', icon: Syringe, target: '/vaccines' },
  { label: 'Learn', icon: BookOpen, target: '/learn' },
  { label: 'Insurance', icon: Shield, target: '/insurance' },
  { label: 'Babysitters', icon: Users, target: '/babysitting' },
  { label: 'Community', icon: HeartHandshake, target: '/community' },
  { label: 'AI Help', icon: Sparkles, target: '/assistant' },
];

const LEARNING = [
  {
    title: 'Tummy time games',
    meta: '0-6 months  |  5 min',
    image: 'https://images.pexels.com/photos/12939229/pexels-photo-12939229.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    tag: 'Sensory',
  },
  {
    title: 'Shape sorting fun',
    meta: '1-2 years  |  10 min',
    image: 'https://images.pexels.com/photos/4309155/pexels-photo-4309155.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    tag: 'Cognitive',
  },
];

export default function HomeScreen() {
  const { theme, parent, cart, activeChild, vaccinesGiven } = useApp();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const bannerWidth = width - 40;
  const cardWidth = (width - 40 - 24) / 2.2;
  const firstName = parent?.name.split(' ')[0] ?? 'there';
  const reminder = vaccineReminder(activeChild, vaccinesGiven, toIsoDate(new Date()));
  const bannerScrollRef = useRef<ScrollView>(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  const onBannerScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setBannerIndex(Math.round(e.nativeEvent.contentOffset.x / (bannerWidth + 12)));
  };

  const goToBanner = (index: number) => {
    bannerScrollRef.current?.scrollTo({ x: index * (bannerWidth + 12), animated: true });
    setBannerIndex(index);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.duration(500)} style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>
              {greeting(new Date())}, {firstName}
            </Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color={theme.muted} />
              <Text style={styles.location}>{parent?.city || 'Your city'}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push('/cart')}
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
              accessibilityLabel="Cart"
            >
              <ShoppingCart size={20} color={theme.ink} />
              {cartCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: theme.strong }]}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              ) : null}
            </Pressable>
            <Pressable
              onPress={() => router.push('/notifications')}
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
              accessibilityLabel="Notifications"
            >
              <Bell size={20} color={theme.ink} />
              <View style={[styles.dot, { backgroundColor: theme.strong }]} />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).delay(60)}>
          <Pressable
            onPress={() => router.navigate('/shop')}
            style={({ pressed }) => [styles.search, pressed && styles.searchPressed]}
            accessibilityRole="search"
          >
            <Search size={18} color={theme.muted} />
            <Text style={styles.searchText}>Search diapers, feeding, toys...</Text>
          </Pressable>
        </Animated.View>

        <ChildSwitcher />

        {/* Banner carousel */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <ScrollView
            ref={bannerScrollRef}
            horizontal
            pagingEnabled={false}
            showsHorizontalScrollIndicator={false}
            snapToInterval={bannerWidth + 12}
            decelerationRate="fast"
            onMomentumScrollEnd={onBannerScrollEnd}
            onScrollEndDrag={onBannerScrollEnd}
            contentContainerStyle={styles.bannerRow}
          >
            {BANNERS.map((banner, i) => (
              <Pressable
                key={banner.title}
                onPress={() => router.navigate(banner.target)}
                style={({ pressed }) => [styles.banner, { width: bannerWidth }, pressed && styles.bannerPressed]}
              >
                <Image source={{ uri: banner.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                <View style={[styles.bannerShade, { backgroundColor: banner.tint }]} />
                <View style={styles.bannerCopy}>
                  <Text style={styles.bannerBadge}>{i === 0 ? 'Limited time' : i === 1 ? 'First order' : 'Free'}</Text>
                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                  <Text style={styles.bannerBody}>{banner.body}</Text>
                  <View style={styles.bannerCtaRow}>
                    <Text style={styles.bannerCta}>{banner.cta}</Text>
                    <ChevronRight size={16} color="#FFFFFF" />
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.dots}>
            {BANNERS.map((banner, i) => (
              <Pressable
                key={banner.title}
                onPress={() => goToBanner(i)}
                accessibilityLabel={`Go to banner ${i + 1}`}
                style={[styles.dot2, i === bannerIndex && styles.dot2Active]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Services grid */}
        <Animated.View entering={FadeInDown.duration(500).delay(140)}>
          <SectionTitle title="Explore Baby Bliss" styles={styles} />
          <View style={styles.servicesGrid}>
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <Pressable
                  key={service.label}
                  onPress={() => router.navigate(service.target)}
                  style={({ pressed }) => [styles.serviceTile, pressed && styles.servicePressed]}
                  accessibilityRole="button"
                >
                  <View style={styles.serviceIcon}>
                    <Icon size={22} color={theme.strong} />
                  </View>
                  <Text style={styles.serviceLabel}>{service.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Products */}
        <Animated.View entering={FadeInDown.duration(500).delay(180)}>
          <SectionTitle
            title={`Picked for ${activeChild?.name ?? 'you'}`}
            action="See all"
            onAction={() => router.navigate('/shop')}
            styles={styles}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productRow}>
            {PRODUCTS.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} width={cardWidth} />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Vaccine reminder */}
        {reminder ? (
          <Animated.View entering={FadeInDown.duration(500).delay(220)}>
            <Pressable
              onPress={() => router.navigate('/vaccines')}
              style={({ pressed }) => [styles.reminder, pressed && styles.reminderPressed]}
              accessibilityRole="button"
            >
              <View style={styles.reminderIcon}>
                <Syringe size={22} color={theme.strong} />
              </View>
              <View style={styles.reminderCopy}>
                <Text style={styles.reminderTitle}>{reminder.title}</Text>
                <Text style={styles.reminderBody}>{reminder.body}</Text>
              </View>
              <View style={styles.reminderCtaRow}>
                <Text style={styles.reminderButtonText}>{reminder.actionLabel}</Text>
                <ChevronRight size={16} color={theme.strong} />
              </View>
            </Pressable>
          </Animated.View>
        ) : null}

        {/* Learning cards */}
        <Animated.View entering={FadeInDown.duration(500).delay(260)}>
          <SectionTitle
            title="Learning for this age"
            action="Open Learn"
            onAction={() => router.navigate('/learn')}
            styles={styles}
          />
          <View style={styles.learnRow}>
            {LEARNING.map((item) => (
              <Pressable
                key={item.title}
                onPress={() => router.navigate('/learn')}
                style={({ pressed }) => [styles.learnCard, pressed && styles.learnPressed]}
              >
                <Image source={{ uri: item.image }} style={styles.learnImage} resizeMode="cover" />
                <View style={styles.learnCopy}>
                  <View style={styles.learnTagRow}>
                    <Text style={styles.learnTag}>{item.tag}</Text>
                  </View>
                  <Text style={styles.learnTitle}>{item.title}</Text>
                  <Text style={styles.learnMeta}>{item.meta}</Text>
                </View>
                <ChevronRight size={18} color={theme.muted} />
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({
  title,
  action,
  onAction,
  styles,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 36, gap: 22 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerText: { flex: 1, gap: 4 },
    greeting: { fontFamily: FONT.bold, fontSize: 24, color: t.ink, lineHeight: 30 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    location: { fontFamily: FONT.semibold, fontSize: 13, color: t.muted },
    headerActions: { flexDirection: 'row', gap: 10 },
    iconButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: t.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.border,
    },
    iconPressed: { opacity: 0.8, transform: [{ scale: 0.95 }] },
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
    dot: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, borderRadius: 4 },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 54,
      paddingHorizontal: 18,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    searchPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
    searchText: { fontFamily: FONT.regular, fontSize: 15, color: t.muted },

    // Banner carousel
    bannerRow: { gap: 12 },
    banner: {
      height: 180,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: t.secondary,
      justifyContent: 'flex-end',
    },
    bannerPressed: { opacity: 0.95, transform: [{ scale: 0.99 }] },
    bannerShade: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
    bannerCopy: { padding: 20, gap: 4 },
    bannerBadge: {
      alignSelf: 'flex-start',
      fontFamily: FONT.bold,
      fontSize: 11,
      color: '#FFFFFF',
      backgroundColor: 'rgba(255, 255, 255, 0.22)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      marginBottom: 4,
      overflow: 'hidden',
    },
    bannerTitle: { fontFamily: FONT.bold, fontSize: 22, color: '#FFFFFF', lineHeight: 28 },
    bannerBody: { fontFamily: FONT.regular, fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 20 },
    bannerCtaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
    bannerCta: { fontFamily: FONT.bold, fontSize: 14, color: '#FFFFFF' },

    dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
    dot2: { width: 8, height: 8, borderRadius: 4, backgroundColor: t.border },
    dot2Active: { width: 24, borderRadius: 4, backgroundColor: t.strong },

    // Sections
    sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionTitle: { fontFamily: FONT.bold, fontSize: 18, color: t.ink },
    sectionAction: { fontFamily: FONT.bold, fontSize: 14, color: t.strong },

    // Services grid
    servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16, marginTop: 4 },
    serviceTile: { width: '25%', alignItems: 'center', gap: 8 },
    servicePressed: { opacity: 0.85, transform: [{ scale: 0.95 }] },
    serviceIcon: {
      width: 56,
      height: 56,
      borderRadius: 20,
      backgroundColor: t.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    serviceLabel: { fontFamily: FONT.semibold, fontSize: 12, color: t.ink, textAlign: 'center' },

    // Products
    productRow: { gap: 12, paddingRight: 20, paddingTop: 4 },

    // Vaccine reminder
    reminder: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 18,
      borderRadius: 20,
      backgroundColor: t.secondary,
      borderWidth: 1,
      borderColor: t.border,
    },
    reminderPressed: { opacity: 0.95, transform: [{ scale: 0.99 }] },
    reminderIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: t.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reminderCopy: { flex: 1, gap: 2 },
    reminderTitle: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    reminderBody: { fontFamily: FONT.regular, fontSize: 13, color: t.muted, lineHeight: 18 },
    reminderCtaRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    reminderButtonText: { fontFamily: FONT.bold, fontSize: 13, color: t.strong },

    // Learning cards
    learnRow: { gap: 12, paddingTop: 4 },
    learnCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 12,
      paddingRight: 16,
      borderRadius: 20,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    learnPressed: { opacity: 0.95, transform: [{ scale: 0.99 }] },
    learnImage: { width: 72, height: 72, borderRadius: 16, backgroundColor: t.secondary },
    learnCopy: { flex: 1, gap: 3 },
    learnTagRow: { flexDirection: 'row' },
    learnTag: {
      fontFamily: FONT.bold,
      fontSize: 10,
      color: t.strong,
      backgroundColor: t.secondary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      overflow: 'hidden',
    },
    learnTitle: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    learnMeta: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
  });
}

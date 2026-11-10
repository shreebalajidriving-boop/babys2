import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { FONT, PALETTES } from '@/lib/theme';

const palette = PALETTES.neutral;

const SLIDES = [
  {
    image: 'https://images.pexels.com/photos/21268301/pexels-photo-21268301.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    title: 'Everything your little one needs',
    body: 'Baby essentials, feeding, bath and toys delivered to your door in hours.',
  },
  {
    image: 'https://images.pexels.com/photos/4642251/pexels-photo-4642251.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    title: 'Care you can count on',
    body: 'Book trusted pediatricians, lab tests and vaccinations without the waiting room.',
  },
  {
    image: 'https://images.pexels.com/photos/37529274/pexels-photo-37529274.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    title: 'Growing together',
    body: 'Age-based learning, insurance and a community of parents, all in one app.',
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isLast = index === SLIDES.length - 1;

  const goToSlide = (next: number) => {
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setIndex(next);
  };

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const finish = () => router.replace('/login');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable onPress={finish} hitSlop={12} accessibilityRole="button">
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        style={styles.pager}
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={[styles.slide, { width }]}>
            <View style={styles.imageCard}>
              <Image source={{ uri: slide.image }} style={styles.image} resizeMode="cover" />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => (
            <Pressable
              key={slide.title}
              onPress={() => goToSlide(i)}
              accessibilityLabel={`Slide ${i + 1}`}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
        <PrimaryButton label={isLast ? 'Get started' : 'Next'} onPress={() => (isLast ? finish() : goToSlide(index + 1))} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, paddingTop: 8, minHeight: 44 },
  skip: { fontFamily: FONT.semibold, fontSize: 15, color: palette.strong },
  pager: { flex: 1 },
  slide: { paddingHorizontal: 24, paddingTop: 16, gap: 16 },
  imageCard: {
    height: 380,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: palette.secondary,
  },
  image: { width: '100%', height: '100%' },
  title: { fontFamily: FONT.bold, fontSize: 26, color: palette.ink, lineHeight: 32 },
  body: { fontFamily: FONT.regular, fontSize: 16, color: palette.muted, lineHeight: 24 },
  footer: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 16, gap: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.primary, opacity: 0.4 },
  dotActive: { width: 24, opacity: 1, backgroundColor: palette.strong },
});

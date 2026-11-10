import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, Pause, Play } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { getLearningItem } from '@/lib/learning';
import { FONT, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useToast } from '@/components/Toast';

// The player is a demo: progress advances over a few seconds rather than streaming real footage.
const DEMO_PLAY_SECONDS = 12;

export default function ActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, completedVideos, toggleVideoCompleted } = useApp();
  const toast = useToast();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const item = getLearningItem(id);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(1, p + 1 / DEMO_PLAY_SECONDS);
        if (next >= 1) setPlaying(false);
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [playing]);

  if (!item) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Activity" />
        <EmptyState title="Activity not found" message="This activity is no longer available." actionLabel="Back to Learn" onAction={() => router.navigate('/learn')} />
      </SafeAreaView>
    );
  }

  const done = completedVideos.includes(item.id);
  const elapsed = Math.round(progress * DEMO_PLAY_SECONDS);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={item.kind} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {item.kind === 'Video' ? (
          <View style={styles.player}>
            <Image source={{ uri: item.image }} style={styles.poster} />
            <Pressable
              onPress={() => {
                if (progress >= 1) setProgress(0);
                setPlaying((v) => !v);
              }}
              style={styles.playButton}
              accessibilityRole="button"
              accessibilityLabel={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause size={26} color="#FFFFFF" /> : <Play size={26} color="#FFFFFF" />}
            </Pressable>
            <View style={styles.playerBar}>
              <View style={styles.playerTrack}>
                <View style={[styles.playerFill, { width: `${progress * 100}%`, backgroundColor: theme.primary }]} />
              </View>
              <Text style={styles.playerTime}>
                0:{String(elapsed).padStart(2, '0')} / 0:{String(DEMO_PLAY_SECONDS).padStart(2, '0')}
              </Text>
            </View>
          </View>
        ) : (
          <Image source={{ uri: item.image }} style={styles.hero} />
        )}

        <View style={styles.header}>
          <Text style={styles.skill}>{item.skill}  |  {item.ageGroup}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>{item.minutes} minutes</Text>
        </View>

        <Text style={styles.body}>{item.description}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What you will need</Text>
          {item.materials.map((material) => (
            <Text key={material} style={styles.material}>
              {'\u2022'}  {material}
            </Text>
          ))}
        </View>

        {done ? (
          <View style={styles.doneBanner}>
            <CheckCircle2 size={18} color={theme.success} />
            <Text style={styles.doneText}>You have completed this one.</Text>
          </View>
        ) : null}

        <PrimaryButton
          label={done ? 'Mark as not completed' : 'Mark as completed'}
          variant={done ? 'outline' : 'solid'}
          onPress={() => {
            toggleVideoCompleted(item.id);
            toast(done ? 'Removed from completed' : 'Marked as completed');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 16 },
    player: { borderRadius: 20, overflow: 'hidden', backgroundColor: '#15202E' },
    poster: { width: '100%', height: 200, backgroundColor: t.secondary },
    playButton: {
      position: 'absolute',
      top: 72,
      alignSelf: 'center',
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(20, 28, 40, 0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      left: '50%',
      marginLeft: -28,
    },
    playerBar: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
    playerTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#3D4F68', overflow: 'hidden' },
    playerFill: { height: 4, borderRadius: 2 },
    playerTime: { fontFamily: FONT.semibold, fontSize: 12, color: '#FFFFFF' },
    hero: { width: '100%', height: 200, borderRadius: 20, backgroundColor: t.secondary },
    header: { gap: 4 },
    skill: { fontFamily: FONT.semibold, fontSize: 12, color: t.strong },
    title: { fontFamily: FONT.bold, fontSize: 22, color: t.ink },
    meta: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    body: { fontFamily: FONT.regular, fontSize: 15, color: t.ink, lineHeight: 22 },
    card: { padding: 16, borderRadius: 18, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, gap: 8 },
    cardTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    material: { fontFamily: FONT.regular, fontSize: 14, color: t.ink },
    doneBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 14,
      borderRadius: 14,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.success,
    },
    doneText: { fontFamily: FONT.semibold, fontSize: 14, color: t.ink },
  });
}

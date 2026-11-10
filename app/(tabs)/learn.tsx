import { router } from 'expo-router';
import { CheckCircle2, Clock } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AGE_GROUPS } from '@/components/ChildForm';
import { useApp } from '@/lib/AppContext';
import { LEARNING_ITEMS, type LearningItem } from '@/lib/learning';
import { FONT, type Palette } from '@/lib/theme';
import { FilterChips } from '@/components/FilterChips';

const AGE_OPTIONS = AGE_GROUPS.map((group) => ({ value: group, label: group }));

export default function LearnTab() {
  const { theme, activeChild, completedVideos } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [ageGroup, setAgeGroup] = useState<string>(activeChild?.ageGroup ?? AGE_GROUPS[0]);

  const items = LEARNING_ITEMS.filter((item) => item.ageGroup === ageGroup);
  const completedAll = LEARNING_ITEMS.filter((item) => completedVideos.includes(item.id));
  const minutesDone = completedAll.reduce((sum, item) => sum + item.minutes, 0);
  const percent = Math.round((completedAll.length / LEARNING_ITEMS.length) * 100);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.title}>Learn</Text>
          <Text style={styles.subtitle}>Play-based ideas picked for {activeChild?.name ?? 'your child'}</Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressTitle}>Your progress</Text>
            <Text style={styles.progressPercent}>{percent}%</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${percent}%`, backgroundColor: theme.strong }]} />
          </View>
          <Text style={styles.progressMeta}>
            {completedAll.length} of {LEARNING_ITEMS.length} completed  |  {minutesDone} minutes of play
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age group</Text>
          <FilterChips options={AGE_OPTIONS} value={ageGroup} onChange={setAgeGroup} />
        </View>

        <View style={styles.list}>
          {items.map((item) => (
            <ActivityCard
              key={item.id}
              item={item}
              done={completedVideos.includes(item.id)}
              styles={styles}
              doneColor={theme.success}
              mutedColor={theme.muted}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActivityCard({
  item,
  done,
  styles,
  doneColor,
  mutedColor,
}: {
  item: LearningItem;
  done: boolean;
  styles: ReturnType<typeof makeStyles>;
  doneColor: string;
  mutedColor: string;
}) {
  return (
    <Pressable
      onPress={() => router.navigate(`/activity/${item.id}`)}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <Image source={{ uri: item.image }} style={styles.thumb} />
      <View style={styles.cardCopy}>
        <Text style={styles.kind}>{item.kind}  |  {item.skill}</Text>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.metaRow}>
          <Clock size={13} color={mutedColor} />
          <Text style={styles.meta}>{item.minutes} min</Text>
          {done ? (
            <View style={styles.doneRow}>
              <CheckCircle2 size={14} color={doneColor} />
              <Text style={[styles.doneText, { color: doneColor }]}>Completed</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, gap: 20 },
    title: { fontFamily: FONT.bold, fontSize: 26, color: t.ink },
    subtitle: { fontFamily: FONT.regular, fontSize: 14, color: t.muted, marginTop: 2 },
    progressCard: { padding: 18, borderRadius: 20, backgroundColor: t.secondary, gap: 10 },
    progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    progressTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    progressPercent: { fontFamily: FONT.bold, fontSize: 16, color: t.strong },
    track: { height: 8, borderRadius: 4, backgroundColor: t.card, overflow: 'hidden' },
    fill: { height: 8, borderRadius: 4 },
    progressMeta: { fontFamily: FONT.regular, fontSize: 13, color: t.ink },
    section: { gap: 12 },
    sectionTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    list: { gap: 12 },
    card: {
      flexDirection: 'row',
      gap: 12,
      padding: 12,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      alignItems: 'center',
    },
    thumb: { width: 84, height: 84, borderRadius: 14, backgroundColor: t.secondary },
    cardCopy: { flex: 1, gap: 4 },
    kind: { fontFamily: FONT.semibold, fontSize: 12, color: t.strong },
    cardTitle: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    meta: { fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    doneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8 },
    doneText: { fontFamily: FONT.semibold, fontSize: 12 },
  });
}

import { router } from 'expo-router';
import { ChevronRight, PiggyBank } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/lib/AppContext';
import { formatINR } from '@/lib/format';
import { SAVINGS_DISCLAIMER, savedTotal, savingsProgress } from '@/lib/savings';
import { FONT, type Palette } from '@/lib/theme';
import type { SavingsGoal } from '@/lib/types';

export default function SavingsScreen() {
  const { theme, savingsGoals, children } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Child savings goals" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Set a target for school, college or a family goal, and track how close you are.</Text>

        {savingsGoals.length === 0 ? (
          <EmptyState
            icon={<PiggyBank size={32} color={theme.strong} />}
            title="No savings goals yet"
            message="Start with one goal for your child's future."
            actionLabel="Create a goal"
            onAction={() => router.navigate('/savings/new')}
          />
        ) : (
          <View style={styles.list}>
            {savingsGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                childName={children.find((c) => c.id === goal.childId)?.name ?? 'Your child'}
                styles={styles}
                theme={theme}
              />
            ))}
            <PrimaryButton label="New goal" variant="outline" onPress={() => router.navigate('/savings/new')} />
          </View>
        )}

        <Text style={styles.disclaimer}>{SAVINGS_DISCLAIMER}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function GoalCard({
  goal,
  childName,
  styles,
  theme,
}: {
  goal: SavingsGoal;
  childName: string;
  styles: ReturnType<typeof makeStyles>;
  theme: Palette;
}) {
  const progress = savingsProgress(goal);
  return (
    <Pressable
      onPress={() => router.navigate(`/savings/${goal.id}`)}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`Open ${goal.name}`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>{goal.name}</Text>
          <Text style={styles.cardMeta}>For {childName}</Text>
        </View>
        <ChevronRight size={18} color={theme.muted} />
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(progress * 100)}%`, backgroundColor: theme.strong }]} />
      </View>
      <Text style={styles.cardMeta}>
        {formatINR(savedTotal(goal))} of {formatINR(goal.targetAmount)} saved
      </Text>
    </Pressable>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingBottom: 32, gap: 24 },
    intro: { fontFamily: FONT.regular, fontSize: 14, color: t.muted, lineHeight: 21 },
    list: { gap: 12 },
    card: { padding: 18, gap: 12, borderRadius: 18, backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardCopy: { flex: 1, gap: 2 },
    cardTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    cardMeta: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    track: { height: 8, borderRadius: 4, backgroundColor: t.secondary, overflow: 'hidden' },
    fill: { height: 8, borderRadius: 4 },
    disclaimer: { fontFamily: FONT.regular, fontSize: 12, color: t.muted, lineHeight: 18 },
  });
}

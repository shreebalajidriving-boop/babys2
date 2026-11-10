import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useToast } from '@/components/Toast';
import { useApp } from '@/lib/AppContext';
import { formatINR, formatOrderDate } from '@/lib/format';
import {
  monthsRemaining,
  parseAmount,
  projectedCompletion,
  SAVINGS_MAX_AMOUNT,
  savedTotal,
  savingsProgress,
} from '@/lib/savings';
import { FONT, type Palette } from '@/lib/theme';

export default function SavingsGoalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, savingsGoals, children, addSavingsContribution } = useApp();
  const showToast = useToast();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [adding, setAdding] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const goal = savingsGoals.find((g) => g.id === id);
  if (!goal) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Savings goal" />
        <EmptyState title="Goal not found" message="This savings goal could not be found." />
      </SafeAreaView>
    );
  }

  const saved = savedTotal(goal);
  const remainingMonths = monthsRemaining(goal);
  const done = saved >= goal.targetAmount;
  const childName = children.find((c) => c.id === goal.childId)?.name ?? 'Your child';
  const history = [...goal.contributions].sort((a, b) => b.createdAt - a.createdAt);

  const addMoney = () => {
    const amount = parseAmount(amountInput);
    if (amount <= 0 || amount > SAVINGS_MAX_AMOUNT) return setError('Enter the amount you saved.');
    setError(null);
    addSavingsContribution(goal.id, amount);
    setAmountInput('');
    setAdding(false);
    showToast(`${formatINR(amount)} added to ${goal.name}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={goal.name} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <Text style={styles.metaLabel}>For {childName}</Text>
          <Text style={styles.amount}>{formatINR(saved)}</Text>
          <Text style={styles.metaText}>of {formatINR(goal.targetAmount)} target</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(savingsProgress(goal) * 100)}%`, backgroundColor: theme.strong }]} />
          </View>
          <Text style={styles.metaText}>
            {done
              ? 'Goal reached. Well done.'
              : `${remainingMonths} month${remainingMonths === 1 ? '' : 's'} to go at ${formatINR(goal.monthlyAmount)} a month, around ${formatOrderDate(projectedCompletion(goal, Date.now()))}.`}
          </Text>
        </View>

        {adding ? (
          <View style={styles.form}>
            <Text style={styles.label}>Amount saved</Text>
            <TextInput
              value={amountInput}
              onChangeText={setAmountInput}
              style={styles.input}
              placeholder={`e.g. ${goal.monthlyAmount}`}
              placeholderTextColor={theme.muted}
              keyboardType="number-pad"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton label="Add to goal" onPress={addMoney} />
            <PrimaryButton
              label="Cancel"
              variant="outline"
              onPress={() => {
                setAdding(false);
                setError(null);
              }}
            />
          </View>
        ) : (
          <PrimaryButton label="Add money" onPress={() => setAdding(true)} />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>History</Text>
          {history.length === 0 ? (
            <Text style={styles.metaText}>No money added yet.</Text>
          ) : (
            history.map((entry) => (
              <View key={entry.id} style={styles.row}>
                <Text style={styles.rowDate}>{formatOrderDate(entry.createdAt)}</Text>
                <Text style={styles.rowAmount}>{formatINR(entry.amount)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingBottom: 32, gap: 24 },
    summary: { gap: 8, padding: 20, borderRadius: 20, backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
    metaLabel: { fontFamily: FONT.bold, fontSize: 12, color: t.strong, textTransform: 'uppercase', letterSpacing: 0.5 },
    amount: { fontFamily: FONT.bold, fontSize: 30, color: t.ink },
    metaText: { fontFamily: FONT.regular, fontSize: 14, color: t.muted, lineHeight: 21 },
    track: { height: 8, borderRadius: 4, backgroundColor: t.secondary, overflow: 'hidden', marginVertical: 4 },
    fill: { height: 8, borderRadius: 4 },
    form: { gap: 12, padding: 16, borderRadius: 18, backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
    label: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    input: {
      minHeight: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.background,
      paddingHorizontal: 16,
      fontFamily: FONT.regular,
      fontSize: 16,
      color: t.ink,
    },
    error: { fontFamily: FONT.semibold, fontSize: 13, color: t.error },
    section: { gap: 12 },
    sectionTitle: { fontFamily: FONT.bold, fontSize: 18, color: t.ink },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 14,
      borderRadius: 14,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    rowDate: { fontFamily: FONT.regular, fontSize: 14, color: t.muted },
    rowAmount: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
  });
}

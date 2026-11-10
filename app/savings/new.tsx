import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FilterChips } from '@/components/FilterChips';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useToast } from '@/components/Toast';
import { useApp } from '@/lib/AppContext';
import { formatINR, formatOrderDate } from '@/lib/format';
import { parseAmount, projectedCompletion, SAVINGS_GOAL_PRESETS, SAVINGS_MAX_AMOUNT } from '@/lib/savings';
import { FONT, type Palette } from '@/lib/theme';
import type { SavingsGoal } from '@/lib/types';

export default function NewSavingsGoalScreen() {
  const { theme, children, activeChild, addSavingsGoal } = useApp();
  const showToast = useToast();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [childId, setChildId] = useState(activeChild?.id ?? children[0]?.id ?? '');
  const [presetId, setPresetId] = useState('school');
  const [name, setName] = useState(SAVINGS_GOAL_PRESETS[0].name);
  const [target, setTarget] = useState('');
  const [monthly, setMonthly] = useState('');
  const [error, setError] = useState<string | null>(null);

  const targetAmount = parseAmount(target);
  const monthlyAmount = parseAmount(monthly);
  const previewGoal: SavingsGoal = {
    id: '',
    createdAt: Date.now(),
    childId,
    name,
    targetAmount,
    monthlyAmount,
    contributions: [],
  };
  const canPreview = targetAmount > 0 && monthlyAmount > 0 && monthlyAmount <= targetAmount;

  const choosePreset = (id: string) => {
    setPresetId(id);
    setName(SAVINGS_GOAL_PRESETS.find((p) => p.id === id)?.name ?? '');
  };

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return setError('Give your goal a name.');
    if (trimmed.length > 40) return setError('Keep the goal name under 40 characters.');
    if (targetAmount <= 0 || targetAmount > SAVINGS_MAX_AMOUNT) return setError('Enter a target amount.');
    if (monthlyAmount <= 0 || monthlyAmount > SAVINGS_MAX_AMOUNT) return setError('Enter a monthly amount.');
    if (monthlyAmount > targetAmount) return setError('The monthly amount cannot be more than the target.');
    setError(null);
    const id = addSavingsGoal({ childId, name: trimmed, targetAmount, monthlyAmount });
    showToast('Savings goal created');
    router.replace(`/savings/${id}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="New savings goal" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children.length > 1 ? (
          <View style={styles.field}>
            <Text style={styles.label}>For</Text>
            <FilterChips
              options={children.map((c) => ({ value: c.id, label: c.name }))}
              value={childId}
              onChange={setChildId}
            />
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Goal</Text>
          <FilterChips options={SAVINGS_GOAL_PRESETS.map((p) => ({ value: p.id, label: p.label }))} value={presetId} onChange={choosePreset} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Goal name</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="e.g. School fees" placeholderTextColor={theme.muted} maxLength={40} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Target amount</Text>
          <TextInput value={target} onChangeText={setTarget} style={styles.input} placeholder="e.g. 500000" placeholderTextColor={theme.muted} keyboardType="number-pad" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Monthly contribution</Text>
          <TextInput value={monthly} onChangeText={setMonthly} style={styles.input} placeholder="e.g. 5000" placeholderTextColor={theme.muted} keyboardType="number-pad" />
        </View>

        {canPreview ? (
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>At this pace</Text>
            <Text style={styles.previewBody}>
              You will reach {formatINR(targetAmount)} by {formatOrderDate(projectedCompletion(previewGoal, Date.now()))}, saving{' '}
              {formatINR(monthlyAmount)} a month. No returns are assumed.
            </Text>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton label="Create goal" onPress={save} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingBottom: 32, gap: 24 },
    field: { gap: 8 },
    label: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    input: {
      minHeight: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
      paddingHorizontal: 16,
      fontFamily: FONT.regular,
      fontSize: 16,
      color: t.ink,
    },
    preview: { gap: 6, padding: 16, borderRadius: 16, backgroundColor: t.secondary },
    previewTitle: { fontFamily: FONT.bold, fontSize: 14, color: t.strong },
    previewBody: { fontFamily: FONT.regular, fontSize: 14, color: t.ink, lineHeight: 21 },
    error: { fontFamily: FONT.semibold, fontSize: 13, color: t.error },
  });
}

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/lib/AppContext';
import { FONT } from '@/lib/theme';

export function StepProgress({ labels, index }: { labels: string[]; index: number }) {
  const { theme } = useApp();
  return (
    <View style={styles.progress}>
      {labels.map((label, i) => (
        <View key={label} style={styles.progressItem}>
          <View style={[styles.progressBar, { backgroundColor: i <= index ? theme.strong : theme.border }]} />
          <Text style={[styles.progressLabel, { color: i === index ? theme.strong : theme.muted }]}>
            {i + 1}. {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useApp();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.ink }]}>{title}</Text>
      {children}
    </View>
  );
}

export function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  const { theme } = useApp();
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: theme.ink }, bold && { fontFamily: FONT.bold }]}>{value}</Text>
    </View>
  );
}

export function RadioOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { theme } = useApp();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.option, { borderColor: selected ? theme.strong : theme.border, backgroundColor: theme.card }]}
    >
      <View style={[styles.radio, { borderColor: selected ? theme.strong : theme.muted }]}>
        {selected ? <View style={[styles.radioDot, { backgroundColor: theme.strong }]} /> : null}
      </View>
      <Text style={[styles.optionLabel, { color: theme.ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 8 },
  progressItem: { flex: 1, gap: 6 },
  progressBar: { height: 4, borderRadius: 2 },
  progressLabel: { fontFamily: FONT.semibold, fontSize: 11 },
  section: { gap: 12 },
  sectionTitle: { fontFamily: FONT.bold, fontSize: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  summaryLabel: { fontFamily: FONT.regular, fontSize: 14 },
  summaryValue: { flexShrink: 1, fontFamily: FONT.semibold, fontSize: 14, textAlign: 'right' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  optionLabel: { fontFamily: FONT.semibold, fontSize: 15 },
});

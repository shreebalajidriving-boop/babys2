import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/lib/AppContext';
import { dayOptions } from '@/lib/schedule';
import { FONT } from '@/lib/theme';

export function DayPicker({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const { theme } = useApp();
  const days = dayOptions(7);
  return (
    <View style={styles.days}>
      {days.map((day) => {
        const active = day.iso === value;
        return (
          <Pressable
            key={day.iso}
            onPress={() => onChange(day.iso)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.day,
              { borderColor: active ? theme.strong : theme.border, backgroundColor: active ? theme.strong : theme.card },
            ]}
          >
            <Text style={[styles.dayWeek, { color: active ? '#FFFFFF' : theme.muted }]}>{day.weekday}</Text>
            <Text style={[styles.dayNumber, { color: active ? '#FFFFFF' : theme.ink }]}>{day.day}</Text>
            <Text style={[styles.dayWeek, { color: active ? '#FFFFFF' : theme.muted }]}>{day.month}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SlotGrid({
  slots,
  value,
  onChange,
}: {
  slots: readonly { time: string; available: boolean }[];
  value: string | null;
  onChange: (time: string) => void;
}) {
  const { theme } = useApp();
  return (
    <View style={styles.slots}>
      {slots.map((slot) => {
        const active = slot.time === value;
        return (
          <Pressable
            key={slot.time}
            disabled={!slot.available}
            onPress={() => onChange(slot.time)}
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled: !slot.available }}
            style={[
              styles.slot,
              { borderColor: active ? theme.strong : theme.border, backgroundColor: active ? theme.strong : theme.card },
              !slot.available && styles.slotDisabled,
            ]}
          >
            <Text
              style={[
                styles.slotText,
                { color: active ? '#FFFFFF' : theme.ink },
                !slot.available && { color: theme.muted, textDecorationLine: 'line-through' },
              ]}
            >
              {slot.time}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  days: { flexDirection: 'row', gap: 8 },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 2,
  },
  dayWeek: { fontFamily: FONT.semibold, fontSize: 12 },
  dayNumber: { fontFamily: FONT.bold, fontSize: 18 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, minWidth: '30%', alignItems: 'center' },
  slotDisabled: { opacity: 0.6 },
  slotText: { fontFamily: FONT.semibold, fontSize: 13 },
});

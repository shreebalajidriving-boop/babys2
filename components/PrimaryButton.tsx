import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useApp } from '@/lib/AppContext';
import { FONT } from '@/lib/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'outline';
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({ label, onPress, variant = 'solid', disabled, loading }: Props) {
  const { theme } = useApp();
  const solid = variant === 'solid';
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        solid
          ? { backgroundColor: theme.strong }
          : { backgroundColor: theme.card, borderWidth: 1.5, borderColor: theme.strong },
        inactive && styles.disabled,
        pressed && !inactive && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={solid ? '#FFFFFF' : theme.strong} />
      ) : (
        <Text style={[styles.label, { color: solid ? '#FFFFFF' : theme.strong }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});

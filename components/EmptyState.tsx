import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/lib/AppContext';
import { FONT, type Palette } from '@/lib/theme';
import { PrimaryButton } from '@/components/PrimaryButton';

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.wrap}>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <PrimaryButton label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    wrap: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 8 },
    iconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: t.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    title: { fontFamily: FONT.bold, fontSize: 18, color: t.ink, textAlign: 'center' },
    message: { fontFamily: FONT.regular, fontSize: 15, color: t.muted, textAlign: 'center', lineHeight: 22 },
    action: { marginTop: 16, alignSelf: 'stretch' },
  });
}

import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useApp } from '@/lib/AppContext';
import { PHONE_MAX } from '@/components/PhoneModal';

/** Centers the app in a phone-width frame on large web screens. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { theme } = useApp();
  const { width } = useWindowDimensions();
  const framed = Platform.OS === 'web' && width > PHONE_MAX + 48;

  if (!framed) {
    return <View style={[styles.fill, { backgroundColor: theme.background }]}>{children}</View>;
  }

  return (
    <View style={[styles.stage, { backgroundColor: theme.secondary }]}>
      <View
        style={[
          styles.phone,
          {
            backgroundColor: theme.background,
            borderColor: theme.border,
            maxHeight: Math.min(920, typeof window !== 'undefined' ? window.innerHeight - 32 : 920),
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  phone: {
    width: '100%',
    maxWidth: PHONE_MAX,
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#1E2433',
    shadowOpacity: 0.12,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
});
